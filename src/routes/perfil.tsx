import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { photos } from "@/lib/hotmatch/data";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { useProfile, useUserPhotos } from "@/hooks/use-profiles";
import { DEMO_IDS } from "@/lib/hotmatch/demo";

export const Route = createFileRoute("/perfil")({
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

const publicGallery = [photos.p1, photos.p2, photos.p3];
const vipGallery = [
  { src: photos.p3, price: 45 },
  { src: photos.p1, price: 60 },
  { src: photos.p4, price: 90 },
  { src: photos.p2, price: 150 },
  { src: photos.p3, price: 60 },
  { src: photos.p1, price: 120 },
];

type ModalKey = "edit" | "privacy" | "role" | "stats" | "support" | null;

function ProfilePage() {
  const { gender, vip } = useAppState();
  const isCreator = gender === "female";
  const myId = DEMO_IDS[gender];
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalKey>(null);

  const { profile, loading: profileLoading } = useProfile(myId);
  const { publicPhotos, vipPhotos } = useUserPhotos(myId);

  // Resolve display values — DB data when loaded, sensible defaults while loading
  const displayName   = profile?.name       ?? (isCreator ? "Bianca" : "Carlos");
  const displayAge    = profile?.age         ?? (isCreator ? 25 : 28);
  const displayBio    = profile?.bio         ?? "";
  const displayAvatar = profile?.avatar_url  ?? (isCreator ? photos.p1 : photos.p3);

  // Gallery: use live photos when available, fall back to local asset arrays
  const livePublic = publicPhotos.length > 0
    ? publicPhotos.map((p) => p.photo_url)
    : publicGallery;

  const liveVip = vipPhotos.length > 0
    ? vipPhotos.map((p) => ({ src: p.photo_url, price: p.coin_price }))
    : vipGallery;

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Perfil" />

      <div className="relative mx-4 h-32 overflow-hidden rounded-3xl">
        <img
          src={displayAvatar}
          alt="Capa do perfil"
          width={768}
          height={1024}
          className="size-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="-mt-10 flex flex-col items-center px-4">
        {profileLoading ? (
          <div className="size-24 rounded-full bg-surface-2 animate-pulse" />
        ) : (
          <span className="ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold">
            <img
              src={displayAvatar}
              alt={displayName}
              width={768}
              height={1024}
              className="size-full rounded-full object-cover"
            />
          </span>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <h2 className="text-xl font-extrabold">
            {displayName}, {displayAge}
          </h2>
          <Crown className="size-4 text-gold" fill="currentColor" />
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
        <CreatorProfile vip={vip} navigate={navigate} onMenu={setModal} publicPhotos={livePublic} vipPhotos={liveVip} />
      ) : (
        <MaleProfile navigate={navigate} onMenu={setModal} />
      )}

      {/* Modals & drawers */}
      <EditProfileModal open={modal === "edit"} onClose={() => setModal(null)} />
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

function CreatorProfile({
  vip,
  navigate,
  onMenu,
  publicPhotos,
  vipPhotos,
}: {
  vip: boolean;
  navigate: ReturnType<typeof useNavigate>;
  onMenu: (k: ModalKey) => void;
  publicPhotos: string[];
  vipPhotos: { src: string; price: number }[];
}) {
  const [tab, setTab] = useState<"public" | "vip">("public");

  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-3 px-4">
        <Stat icon={<Eye className="size-4 text-foreground/70" />} label="Visualizações" value="12,4k" />
        <Stat icon={<Heart className="size-4 text-primary" />} label="Curtidas" value="3.208" />
        <Stat icon={<Gift className="size-4 text-gold" />} label="Mimos" value="472" />
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
          : vipPhotos.map((m, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={m.src}
                  alt={`Mídia VIP ${i + 1}`}
                  width={768}
                  height={1024}
                  loading="lazy"
                  className="size-full scale-110 object-cover blur-lg brightness-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <Lock className="size-5 text-gold" />
                  <span className="text-[10px] font-bold text-gold">{m.price} moedas</span>
                </div>
              </div>
            ))}
      </div>

      <SettingsMenu showEarnings navigate={navigate} onMenu={onMenu} />
    </>
  );
}

function MaleProfile({
  navigate,
  onMenu,
}: {
  navigate: ReturnType<typeof useNavigate>;
  onMenu: (k: ModalKey) => void;
}) {
  const { coins, followed } = useAppState();

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 px-4">
        <Stat icon={<Heart className="size-4 text-primary" />} label="Interações" value="1.042" />
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

      <div className="mt-5 grid grid-cols-2 gap-1.5 px-4">
        {publicGallery.slice(0, 4).map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Foto ${i + 1}`}
            width={768}
            height={1024}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover"
          />
        ))}
      </div>

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
