import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  BarChart2,
  ChevronRight,
  Coins,
  Crown,
  Eye,
  Gift,
  Heart,
  HelpCircle,
  Lock,
  LogOut,
  Settings,
  Shield,
  Users,
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
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/perfil")({
  validateSearch: z.object({
    uid: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Meu Perfil — HotMatch" },
      {
        name: "description",
        content:
          "Gerencie sua galeria pública, sua galeria VIP trancada, estatísticas e configurações da conta HotMatch.",
      },
      { property: "og:title", content: "Meu Perfil — HotMatch" },
      {
        property: "og:description",
        content: "Galeria pública, galeria VIP e estatísticas do seu perfil.",
      },
    ],
  }),
  component: ProfilePage,
});

/* ── Constants for VIP gallery pricing ────────────────────────────────────────── */
const VIP_GALLERY_PRICE = 15;      // standard price in coins
const VIP_GALLERY_PRICE_VIP = 10;  // discounted price for VIP members

type ModalKey = "edit" | "privacy" | "role" | "stats" | "support" | null;

function ProfilePage() {
  const { uid } = Route.useSearch();
  const { gender, vip, profileId, name: storeName, avatarUrl: storeAvatar } = useAppState();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalKey>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /* If uid is present and differs from profileId, we are viewing another user's profile */
  const viewingOther = !!uid && uid !== profileId;
  const targetId = uid ?? profileId ?? "";

  const { profile, loading: profileLoading } = useProfile(targetId, refreshKey);
  const { stats } = useProfileStats(viewingOther ? null : profileId);

  const isCreator = (profile?.gender ?? gender) === "female";
  const isOwnProfile = !viewingOther;

  const displayName   = profile?.name      ?? storeName;
  const displayAge    = profile?.age        ?? null;
  const displayBio    = profile?.bio        ?? "";
  const displayAvatar = profile?.avatar_url ?? storeAvatar;

  const livePublic = profile?.public_photos ?? [];
  const liveVip    = profile?.vip_photos ?? [];

  /* Visitor: load which creator galleries this user has already unlocked */
  const [dbUnlocks, setDbUnlocks] = useState<string[]>([]);
  useEffect(() => {
    if (!profileId || !viewingOther) { setDbUnlocks([]); return; }
    let cancelled = false;
    supabase
      .from("vip_gallery_unlocks")
      .select("creator_id")
      .eq("visitor_id", profileId)
      .then(({ data }) => {
        if (!cancelled && data) setDbUnlocks(data.map((r) => (r as { creator_id: string }).creator_id));
      });
    return () => { cancelled = true; };
  }, [profileId, viewingOther]);

  if (viewingOther && profile) {
    return (
      <VisitorProfile
        profile={profile}
        publicPhotos={livePublic}
        vipPhotos={liveVip}
        isUnlocked={dbUnlocks.includes(targetId)}
        onBack={() => navigate({ to: "/feed" })}
      />
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Perfil" />

      <div className="relative mx-4 h-32 overflow-hidden rounded-3xl">
        {displayAvatar ? (
          <img src={displayAvatar} alt="Capa do perfil" width={768} height={1024} className="size-full object-cover object-top" />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-2 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="-mt-10 flex flex-col items-center px-4">
        {profileLoading ? (
          <div className="size-24 rounded-full bg-surface-2 animate-pulse" />
        ) : (
          <span className="ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold">
            {displayAvatar ? (
              <img src={displayAvatar} alt={displayName} width={200} height={200} className="size-full rounded-full object-cover" />
            ) : (
              <div className="size-full rounded-full bg-surface-2" />
            )}
          </span>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <h2 className="text-xl font-extrabold">
            {displayName}{displayAge ? `, ${displayAge}` : ""}
          </h2>
          {profile?.is_verified && <Crown className="size-4 text-gold" fill="currentColor" />}
        </div>
        <span
          className={`mt-1 rounded-full border px-3 py-1 text-[11px] font-bold ${
            isCreator
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          {isCreator ? (vip ? "VIP Gold ativo" : "Criadora Verificada") : "Membro VIP"}
        </span>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">{displayBio}</p>
      </div>

      {isCreator ? (
        <CreatorProfile vip={vip} navigate={navigate} onMenu={setModal} publicPhotos={livePublic} vipPhotos={liveVip} stats={stats} />
      ) : (
        <MaleProfile navigate={navigate} onMenu={setModal} publicPhotos={livePublic} stats={stats} />
      )}

      {/* Modals & drawers */}
      <EditProfileModal
        open={modal === "edit"}
        onClose={() => setModal(null)}
        profile={profile}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
      <PrivacyModal open={modal === "privacy"} onClose={() => setModal(null)} />
      {isCreator ? (
        <EarningsDrawer open={modal === "role"} onClose={() => setModal(null)} />
      ) : (
        <VipModal open={modal === "role"} onClose={() => setModal(null)} />
      )}
      <StatsDrawer open={modal === "stats"} onClose={() => setModal(null)} />
      <SupportModal open={modal === "support"} onClose={() => setModal(null)} />
    </div>
  );
}

/* ── Visitor viewing a creator's profile ─────────────────────────────────────── */
function VisitorProfile({
  profile,
  publicPhotos,
  vipPhotos,
  isUnlocked,
  onBack,
}: {
  profile: import("@/lib/supabase").DbProfile;
  publicPhotos: string[];
  vipPhotos: string[];
  isUnlocked: boolean;
  onBack: () => void;
}) {
  const { gender, vip, profileId, coins, galleryUnlocks } = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"public" | "vip">("public");
  const [unlocked, setUnlocked] = useState(isUnlocked || galleryUnlocks.includes(profile.id));
  const [paying, setPaying] = useState(false);

  const price = vip ? VIP_GALLERY_PRICE_VIP : VIP_GALLERY_PRICE;

  async function handleUnlock() {
    if (!profileId) return;
    if (unlocked) return;
    if (coins < price) {
      toast.error(`Saldo insuficiente. Você precisa de ${price} moedas.`);
      return;
    }
    setPaying(true);
    try {
      /* a) Debit coins from visitor */
      const { error: debitError } = await supabase
        .from("profiles")
        .update({ coin_balance: coins - price })
        .eq("id", profileId);
      if (debitError) throw new Error(debitError.message);

      /* b) Record transaction */
      await supabase.from("transactions").insert({
        user_id: profileId,
        type: "unlock",
        coins_amount: -price,
        amount: 0,
      });

      /* c) Credit creator earnings (1 coin = R$0.05 conversion for demo) */
      const creatorEarnings = Number(profile.earnings_brl ?? 0) + price * 0.05;
      await supabase
        .from("profiles")
        .update({ earnings_brl: creatorEarnings })
        .eq("id", profile.id);

      /* d) Persist unlock row so it's permanent in DB */
      await supabase
        .from("vip_gallery_unlocks")
        .upsert(
          { visitor_id: profileId, creator_id: profile.id, coins_paid: price },
          { onConflict: "visitor_id,creator_id" },
        );

      /* e) Update local store */
      actions.unlockGallery(profile.id, price);

      setUnlocked(true);
      toast.success("Galeria VIP desbloqueada! 🔓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desbloquear.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <TopBar title={profile.name} />

      {/* Cover + avatar */}
      <div className="relative mx-4 h-32 overflow-hidden rounded-3xl">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="Capa" width={768} height={1024} className="size-full object-cover object-top" />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-2 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="-mt-10 flex flex-col items-center px-4">
        <span className="ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} width={200} height={200} className="size-full rounded-full object-cover" />
          ) : (
            <div className="size-full rounded-full bg-surface-2" />
          )}
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <h2 className="text-xl font-extrabold">
            {profile.name}{profile.age ? `, ${profile.age}` : ""}
          </h2>
          {profile.is_verified && <Crown className="size-4 text-gold" fill="currentColor" />}
        </div>
        <span className="mt-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
          Criadora Verificada
        </span>
        {profile.bio && <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">{profile.bio}</p>}
      </div>

      {/* Gallery tabs */}
      <div className="mx-4 mt-6 flex rounded-full border border-border bg-surface p-1">
        <button
          onClick={() => setTab("public")}
          className={`flex-1 rounded-full py-2 text-xs font-bold transition ${tab === "public" ? "bg-gradient-hot text-primary-foreground shadow-hot" : "text-muted-foreground"}`}
        >
          Galeria pública
        </button>
        <button
          onClick={() => setTab("vip")}
          className={`flex-1 rounded-full py-2 text-xs font-bold transition ${tab === "vip" ? "bg-gradient-gold text-gold-foreground shadow-gold" : "text-muted-foreground"}`}
        >
          Galeria VIP
        </button>
      </div>

      {/* Gallery grid */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
        {tab === "public" ? (
          publicPhotos.length > 0 ? (
            publicPhotos.map((src, i) => (
              <img key={i} src={src} alt={`Foto ${i + 1}`} width={768} height={1024} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
            ))
          ) : (
            <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">Nenhuma foto pública ainda.</p>
          )
        ) : (
          <>
            {vipPhotos.length === 0 ? (
              <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">Esta criadora ainda não adicionou fotos VIP.</p>
            ) : (
              vipPhotos.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                  <img
                    key={i}
                    src={src}
                    alt={`VIP ${i + 1}`}
                    width={768}
                    height={1024}
                    loading="lazy"
                    className={`size-full object-cover transition-all duration-300 ${unlocked ? "" : "scale-110 blur-2xl brightness-50"}`}
                  />
                  {!unlocked && (
                    <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-black/60">
                      <Lock className="size-3 text-gold" />
                    </span>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* VIP unlock CTA */}
      {tab === "vip" && vipPhotos.length > 0 && !unlocked && (
        <div className="mx-4 mt-4 flex flex-col items-center gap-3 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/10 via-primary/5 to-surface p-5 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-gold/40 bg-black/50 shadow-gold">
            <Lock className="size-6 text-gold" />
          </span>
          <div>
            <p className="text-sm font-bold">Galeria VIP bloqueada</p>
            <p className="text-xs text-muted-foreground">
              Desbloqueie todas as {vipPhotos.length} fotos exclusivas de {profile.name}
            </p>
          </div>
          <button
            onClick={handleUnlock}
            disabled={paying}
            className="tap-scale flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-extrabold text-gold-foreground shadow-gold disabled:opacity-50"
          >
            <Coins className="size-4" />
            {paying ? "Processando..." : `Desbloquear por ${price} moedas`}
          </button>
          {vip && (
            <p className="text-[11px] font-semibold text-gold">
              Você ganhou 5 moedas de desconto por ser VIP!
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Saldo atual: {coins} moedas ·{" "}
            <button onClick={() => navigate({ to: "/loja" })} className="font-bold text-primary underline">
              Recarregar
            </button>
          </p>
        </div>
      )}

      {tab === "vip" && unlocked && vipPhotos.length > 0 && (
        <p className="mx-4 mt-3 text-center text-xs font-semibold text-emerald-400">
          Galeria VIP desbloqueada — aproveite! 🔓
        </p>
      )}

      <button
        onClick={onBack}
        className="tap-scale mx-4 mt-6 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground"
      >
        Voltar ao Feed
      </button>
    </div>
  );
}

/* ── Creator's own profile ───────────────────────────────────────────────────── */
function CreatorProfile({
  vip,
  navigate,
  onMenu,
  publicPhotos,
  vipPhotos,
  stats,
}: {
  vip: boolean;
  navigate: ReturnType<typeof useNavigate>;
  onMenu: (k: ModalKey) => void;
  publicPhotos: string[];
  vipPhotos: string[];
  stats: ProfileStats;
}) {
  const [tab, setTab] = useState<"public" | "vip">("public");

  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-3 px-4">
        <Stat icon={<Eye className="size-4 text-foreground/70" />} label="Visualizações" value="0" />
        <Stat icon={<Heart className="size-4 text-primary" />} label="Curtidas" value={stats.likesTotal.toLocaleString("pt-BR")} />
        <Stat icon={<Gift className="size-4 text-gold" />} label="Mimos" value={stats.giftsReceived.toLocaleString("pt-BR")} />
      </div>

      <div className="mx-4 mt-6 flex rounded-full border border-border bg-surface p-1">
        <button
          onClick={() => setTab("public")}
          className={`flex-1 rounded-full py-2 text-xs font-bold transition ${tab === "public" ? "bg-gradient-hot text-primary-foreground shadow-hot" : "text-muted-foreground"}`}
        >
          Galeria pública
        </button>
        <button
          onClick={() => setTab("vip")}
          className={`flex-1 rounded-full py-2 text-xs font-bold transition ${tab === "vip" ? "bg-gradient-gold text-gold-foreground shadow-gold" : "text-muted-foreground"}`}
        >
          Galeria VIP
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 px-4">
        {tab === "public"
          ? publicPhotos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Foto pública ${i + 1}`}
                width={768}
                height={1024}
                loading="lazy"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))
          : /* Creator sees her own VIP photos unblurred */
            vipPhotos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Mídia VIP ${i + 1}`}
                width={768}
                height={1024}
                loading="lazy"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
      </div>

      <SettingsMenu showEarnings navigate={navigate} onMenu={onMenu} />
    </>
  );
}

/* ── Male user's own profile ─────────────────────────────────────────────────── */
function MaleProfile({
  navigate,
  onMenu,
  publicPhotos,
  stats,
}: {
  navigate: ReturnType<typeof useNavigate>;
  onMenu: (k: ModalKey) => void;
  publicPhotos: string[];
  stats: ProfileStats;
}) {
  const { coins, followed } = useAppState();

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 px-4">
        <Stat icon={<Heart className="size-4 text-primary" />} label="Interações" value={stats.likesTotal.toLocaleString("pt-BR")} />
        <Stat icon={<Users className="size-4 text-gold" />} label="Seguindo" value={String(followed.length)} />
      </div>

      <div className="mx-4 mt-5 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Coins className="size-5 text-gold" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Saldo de moedas</p>
            <p className="text-lg font-extrabold text-gradient-gold">{coins}</p>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/loja" })}
          className="tap-scale rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground shadow-gold"
        >
          Recarregar
        </button>
      </div>

      {publicPhotos.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-1.5 px-4">
          {publicPhotos.slice(0, 4).map((src, i) => (
            <img key={i} src={src} alt={`Foto ${i + 1}`} width={400} height={400} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-5 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface py-8 text-center">
          <p className="text-sm font-semibold text-muted-foreground">Galeria vazia</p>
          <p className="text-xs text-muted-foreground">Adicione fotos em "Editar perfil".</p>
        </div>
      )}

      <SettingsMenu navigate={navigate} onMenu={onMenu} />
    </>
  );
}

function SettingsMenu({
  navigate,
  showEarnings,
  onMenu,
}: {
  navigate: ReturnType<typeof useNavigate>;
  showEarnings?: boolean;
  onMenu: (k: ModalKey) => void;
}) {
  const menuItems: { icon: React.ElementType; label: string; key: ModalKey }[] = [
    { icon: Settings, label: "Editar perfil e fotos", key: "edit" },
    { icon: Shield, label: "Privacidade e verificação", key: "privacy" },
    {
      icon: Crown,
      label: showEarnings ? "Dashboard de ganhos" : "Gerenciar assinatura VIP",
      key: "role",
    },
    { icon: BarChart2, label: "Estatísticas do perfil", key: "stats" },
    { icon: HelpCircle, label: "Suporte HotMatch", key: "support" },
  ];

  return (
    <>
      <ul className="mx-4 mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
        {menuItems.map(({ icon: Icon, label, key }) => (
          <li key={key}>
            <button
              onClick={() => onMenu(key)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-0 active:bg-surface-2 transition-colors"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          actions.signOut();
          toast("Você saiu da sua conta.", {
            className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl",
          });
          navigate({ to: "/bem-vindo" });
        }}
        className="tap-scale mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground"
      >
        <LogOut className="size-4" />
        Sair da conta / Alternar conta
      </button>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 text-center">
      <span className="mx-auto grid size-8 place-items-center">{icon}</span>
      <p className="text-base font-extrabold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
