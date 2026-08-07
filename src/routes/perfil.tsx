import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  BarChart2, ChevronRight, Coins, Crown, Eye, Gift,
  Heart, HelpCircle, Lock, LogOut, Settings, Shield, Users, X, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hotmatch/TopBar";
import { EditProfileModal } from "@/components/hotmatch/EditProfileModal";
import { PrivacyModal } from "@/components/hotmatch/PrivacyModal";
import { EarningsDrawer } from "@/components/hotmatch/EarningsDrawer";
import { VipModal } from "@/components/hotmatch/VipModal";
import { StatsDrawer } from "@/components/hotmatch/StatsDrawer";
import { SupportModal } from "@/components/hotmatch/SupportModal";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { useProfile, useProfileStats, type ProfileStats } from "@/hooks/use-profiles";
import { supabase, type DbProfile } from "@/lib/supabase";

export const Route = createFileRoute("/perfil")({
  validateSearch: z.object({ uid: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Meu Perfil — HotMatch" },
      { name: "description", content: "Gerencie seu perfil e fotos na HotMatch." },
    ],
  }),
  component: ProfilePage,
});

const VIP_PRICE = 15;
const VIP_PRICE_DISCOUNT = 10;
type ModalKey = "edit" | "privacy" | "role" | "stats" | "support" | null;

function ProfilePage() {
  const { uid } = Route.useSearch();
  const { gender, vip, profileId, name: storeName, avatarUrl: storeAvatar } = useAppState();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalKey>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const viewingOther = !!uid && uid !== profileId;
  const targetId = uid ?? profileId ?? "";

  const { profile, loading } = useProfile(targetId, refreshKey);
  const { stats } = useProfileStats(viewingOther ? null : profileId);

  const isCreator = (profile?.gender ?? gender) === "female";
  const displayName = profile?.name ?? storeName;
  const displayAge = profile?.age ?? null;
  const displayBio = profile?.bio ?? "";
  const displayAvatar = profile?.avatar_url ?? storeAvatar;

  const livePublic = profile?.public_photos ?? [];
  const liveVip = profile?.vip_photos ?? [];

  const [dbUnlocks, setDbUnlocks] = useState<string[]>([]);
  useEffect(() => {
    if (!profileId || !viewingOther) { setDbUnlocks([]); return; }
    supabase
      .from("vip_gallery_unlocks")
      .select("creator_id")
      .eq("visitor_id", profileId)
      .then(({ data }) => {
        if (data) setDbUnlocks(data.map((r) => (r as { creator_id: string }).creator_id));
      });
  }, [profileId, viewingOther]);

  if (viewingOther && profile) {
    return (
      <VisitorProfile
        profile={profile}
        publicPhotos={livePublic}
        vipPhotos={liveVip}
        isUnlocked={dbUnlocks.includes(targetId)}
        onBack={() => navigate({ to: "/feed" })}
        onImageClick={setSelectedImage}
      />
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Perfil" />

      {/* BANNER DE CAPA (Pega o topo da foto/story) */}
      <div className="relative mx-4 h-36 overflow-hidden rounded-3xl border border-white/10 shadow-lg">
        {displayAvatar ? (
          <img src={displayAvatar} alt="Capa" className="size-full object-cover object-top filter brightness-90" />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-2 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* AVATAR EM BOLINHA (Centralizado e sem vazar) */}
      <div className="-mt-12 flex flex-col items-center px-4 relative z-10">
        {loading ? (
          <div className="size-24 rounded-full bg-surface-2 animate-pulse" />
        ) : (
          <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full p-[3px] ring-match shadow-gold bg-background">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} className="size-full rounded-full object-cover object-center" />
            ) : (
              <div className="size-full rounded-full bg-surface-2" />
            )}
          </span>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <h2 className="text-xl font-extrabold">{displayName}{displayAge ? `, ${displayAge}` : ""}</h2>
          {profile?.is_verified && <Crown className="size-4 text-gold" fill="currentColor" />}
        </div>
        <span className={`mt-1 rounded-full border px-3 py-1 text-[11px] font-bold ${isCreator ? "border-gold/40 bg-gold/10 text-gold" : "border-primary/30 bg-primary/10 text-primary"}`}>
          {isCreator ? (vip ? "VIP Gold ativo" : "Criadora Verificada") : "Membro VIP"}
        </span>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">{displayBio}</p>
      </div>

      {isCreator ? (
        <CreatorProfile
          navigate={navigate}
          onMenu={setModal}
          publicPhotos={livePublic}
          vipPhotos={liveVip}
          stats={stats}
          onImageClick={setSelectedImage}
        />
      ) : (
        <MaleProfile
          navigate={navigate}
          onMenu={setModal}
          publicPhotos={livePublic}
          stats={stats}
          onImageClick={setSelectedImage}
        />
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 grid size-10 place-items-center rounded-full bg-white/10 text-white">
            <X className="size-6" />
          </button>
          <img src={selectedImage} alt="Preview" className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <EditProfileModal open={modal === "edit"} onClose={() => setModal(null)} profile={profile} onSaved={() => setRefreshKey((k) => k + 1)} />
      <PrivacyModal open={modal === "privacy"} onClose={() => setModal(null)} />
      {isCreator ? <EarningsDrawer open={modal === "role"} onClose={() => setModal(null)} /> : <VipModal open={modal === "role"} onClose={() => setModal(null)} />}
      <StatsDrawer open={modal === "stats"} onClose={() => setModal(null)} />
      <SupportModal open={modal === "support"} onClose={() => setModal(null)} />
    </div>
  );
}

function VisitorProfile({ profile, publicPhotos, vipPhotos, isUnlocked, onBack, onImageClick }: {
  profile: DbProfile; publicPhotos: string[]; vipPhotos: string[]; isUnlocked: boolean; onBack: () => void; onImageClick: (u: string) => void;
}) {
  const { vip, profileId, coins, galleryUnlocks } = useAppState();
  const [tab, setTab] = useState<"public" | "vip">("public");
  const [unlocked, setUnlocked] = useState(isUnlocked || galleryUnlocks.includes(profile.id));
  const [paying, setPaying] = useState(false);

  const price = vip ? VIP_PRICE_DISCOUNT : VIP_PRICE;
  const hasPublic = publicPhotos.length > 0;
  const hasVip = vipPhotos.length > 0;

  async function handleUnlock() {
    if (!profileId || unlocked) return;
    if (coins < price) return toast.error(`Saldo insuficiente. Precisa de ${price} moedas.`);
    setPaying(true);
    try {
      await supabase.from("profiles").update({ coin_balance: coins - price }).eq("id", profileId);
      await supabase.from("transactions").insert({ user_id: profileId, type: "unlock", coins_amount: -price, amount: 0 });
      await supabase.from("vip_gallery_unlocks").upsert({ visitor_id: profileId, creator_id: profile.id, coins_paid: price }, { onConflict: "visitor_id,creator_id" });
      actions.unlockGallery(profile.id, price);
      setUnlocked(true);
      toast.success("Galeria VIP desbloqueada!");
    } catch {
      toast.error("Erro ao desbloquear.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <TopBar title={profile.name} />

      <div className="relative mx-4 h-36 overflow-hidden rounded-3xl border border-white/10 shadow-lg">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="Capa" className="size-full object-cover object-top filter brightness-90" />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-2 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="-mt-12 flex flex-col items-center px-4 relative z-10">
        <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full p-[3px] ring-match bg-background">
          <img src={profile.avatar_url || ""} alt={profile.name} className="size-full rounded-full object-cover object-center" />
        </span>
        <h2 className="mt-2 text-xl font-extrabold">{profile.name}</h2>
        <p className="text-sm text-muted-foreground">{profile.bio}</p>
      </div>

      <div className="mx-4 mt-6 flex rounded-full border bg-surface p-1">
        <button onClick={() => setTab("public")} className={`flex-1 rounded-full py-2 text-xs font-bold ${tab === "public" ? "bg-gradient-hot text-white" : "text-muted-foreground"}`}>Pública</button>
        <button onClick={() => setTab("vip")} className={`flex-1 rounded-full py-2 text-xs font-bold ${tab === "vip" ? "bg-gradient-gold text-black" : "text-muted-foreground"}`}>VIP</button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
        {tab === "public" ? (
          hasPublic ? (
            publicPhotos.map((src, i) => (
              <img key={i} src={src} alt="Foto" onClick={() => onImageClick(src)} className="aspect-square w-full cursor-pointer rounded-xl object-cover" />
            ))
          ) : (
            <EmptyGallery text="Esta criadora ainda não adicionou fotos públicas." />
          )
        ) : (
          hasVip ? (
            vipPhotos.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl" onClick={() => unlocked && onImageClick(src)}>
                <img src={src} alt="VIP" className={`size-full object-cover ${unlocked ? "cursor-pointer" : "blur-2xl brightness-50"}`} />
                {!unlocked && <Lock className="absolute inset-0 m-auto size-5 text-gold" />}
              </div>
            ))
          ) : (
            <EmptyGallery text="Esta criadora ainda não adicionou fotos VIP." />
          )
        )}
      </div>

      {tab === "vip" && hasVip && !unlocked && (
        <div className="mx-4 mt-4 flex flex-col items-center gap-3 rounded-3xl border border-gold/25 bg-surface p-5 text-center">
          <p className="text-sm font-bold">Galeria VIP bloqueada</p>
          <button onClick={handleUnlock} disabled={paying} className="flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-extrabold text-black">
            <Coins className="size-4" /> {paying ? "Carregando..." : `Desbloquear por ${price} moedas`}
          </button>
        </div>
      )}

      <button onClick={onBack} className="mx-4 mt-6 w-[calc(100%-2rem)] rounded-full border py-3 text-sm text-muted-foreground">Voltar ao Feed</button>
    </div>
  );
}

function CreatorProfile({ navigate, onMenu, publicPhotos, vipPhotos, stats, onImageClick }: {
  navigate: ReturnType<typeof useNavigate>; onMenu: (k: ModalKey) => void; publicPhotos: string[]; vipPhotos: string[]; stats: ProfileStats; onImageClick: (u: string) => void;
}) {
  const [tab, setTab] = useState<"public" | "vip">("public");
  const hasPublic = publicPhotos.length > 0;
  const hasVip = vipPhotos.length > 0;

  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-3 px-4">
        <Stat icon={<Eye className="size-4" />} label="Visualizações" value="0" />
        <Stat icon={<Heart className="size-4 text-primary" />} label="Curtidas" value={stats.likesTotal.toLocaleString()} />
        <Stat icon={<Gift className="size-4 text-gold" />} label="Mimos" value={stats.giftsReceived.toLocaleString()} />
      </div>

      <div className="mx-4 mt-6 flex rounded-full border bg-surface p-1">
        <button onClick={() => setTab("public")} className={`flex-1 rounded-full py-2 text-xs font-bold ${tab === "public" ? "bg-gradient-hot text-white" : "text-muted-foreground"}`}>Galeria pública</button>
        <button onClick={() => setTab("vip")} className={`flex-1 rounded-full py-2 text-xs font-bold ${tab === "vip" ? "bg-gradient-gold text-black" : "text-muted-foreground"}`}>Galeria VIP</button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
        {tab === "public" ? (
          hasPublic ? (
            publicPhotos.map((src, i) => (
              <img key={i} src={src} alt="Foto pública" onClick={() => onImageClick(src)} className="aspect-square w-full cursor-pointer rounded-xl object-cover" />
            ))
          ) : (
            <EmptyGallery text="Sua galeria pública está vazia. Adicione fotos em Editar perfil." />
          )
        ) : (
          hasVip ? (
            vipPhotos.map((src, i) => (
              <img key={i} src={src} alt="Foto VIP" onClick={() => onImageClick(src)} className="aspect-square w-full cursor-pointer rounded-xl object-cover" />
            ))
          ) : (
            <EmptyGallery text="Sua galeria VIP está vazia. Adicione fotos em Editar perfil." isGold />
          )
        )}
      </div>

      <SettingsMenu showEarnings navigate={navigate} onMenu={onMenu} />
    </>
  );
}

function MaleProfile({ navigate, onMenu, publicPhotos, stats, onImageClick }: {
  navigate: ReturnType<typeof useNavigate>; onMenu: (k: ModalKey) => void; publicPhotos: string[]; stats: ProfileStats; onImageClick: (u: string) => void;
}) {
  const { coins, followed } = useAppState();
  const hasPublic = publicPhotos.length > 0;

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 px-4">
        <Stat icon={<Heart className="size-4 text-primary" />} label="Interações" value={stats.likesTotal.toLocaleString()} />
        <Stat icon={<Users className="size-4 text-gold" />} label="Seguindo" value={String(followed.length)} />
      </div>

      <div className="mx-4 mt-5 flex items-center justify-between rounded-2xl border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Coins className="size-5 text-gold" />
          <div>
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className="text-lg font-extrabold text-gold">{coins} moedas</p>
          </div>
        </div>
        <button onClick={() => navigate({ to: "/loja" })} className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-black">Recarregar</button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1.5 px-4">
        {hasPublic ? (
          publicPhotos.map((src, i) => (
            <img key={i} src={src} alt="Foto" onClick={() => onImageClick(src)} className="aspect-square w-full cursor-pointer rounded-xl object-cover" />
          ))
        ) : (
          <EmptyGallery text="Sua galeria está vazia. Adicione fotos em Editar perfil." />
        )}
      </div>

      <SettingsMenu navigate={navigate} onMenu={onMenu} />
    </>
  );
}

function EmptyGallery({ text, isGold }: { text: string; isGold?: boolean }) {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface py-8 text-center px-4">
      <ImageIcon className={`size-6 ${isGold ? "text-gold" : "text-muted-foreground"}`} />
      <p className="text-xs font-medium text-muted-foreground">{text}</p>
    </div>
  );
}

function SettingsMenu({ navigate, showEarnings, onMenu }: {
  navigate: ReturnType<typeof useNavigate>; showEarnings?: boolean; onMenu: (k: ModalKey) => void;
}) {
  const items: { icon: React.ElementType; label: string; key: ModalKey }[] = [
    { icon: Settings, label: "Editar perfil e fotos", key: "edit" },
    { icon: Shield, label: "Privacidade e verificação", key: "privacy" },
    { icon: Crown, label: showEarnings ? "Dashboard de ganhos" : "Gerenciar assinatura VIP", key: "role" },
    { icon: BarChart2, label: "Estatísticas do perfil", key: "stats" },
    { icon: HelpCircle, label: "Suporte HotMatch", key: "support" },
  ];

  return (
    <>
      <ul className="mx-4 mt-6 overflow-hidden rounded-3xl border bg-surface">
        {items.map(({ icon: Icon, label, key }) => (
          <li key={key}>
            <button onClick={() => onMenu(key)} className="flex w-full items-center gap-3 border-b px-4 py-3.5 text-left active:bg-surface-2 last:border-0">
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          actions.signOut();
          toast("Você saiu da conta.");
          navigate({ to: "/bem-vindo" });
        }}
        className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full border py-3 text-sm text-muted-foreground"
      >
        <LogOut className="size-4" /> Sair da conta
      </button>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-surface p-3 text-center">
      <span className="mx-auto grid size-8 place-items-center">{icon}</span>
      <p className="text-base font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
      }
      
