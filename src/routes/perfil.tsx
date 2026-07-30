import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  Crown,
  Eye,
  Gift,
  Heart,
  HelpCircle,
  Lock,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { TopBar } from "@/components/hotmatch/TopBar";
import { photos, profiles } from "@/lib/hotmatch/data";
import { useAppState } from "@/lib/hotmatch/store";

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

const publicGallery = [photos.p1, photos.p2, photos.p3, photos.p4, photos.p2, photos.p4];
const vipGallery = [
  { src: photos.p3, price: 60 },
  { src: photos.p1, price: 90 },
  { src: photos.p4, price: 45 },
  { src: photos.p2, price: 150 },
];

function ProfilePage() {
  const [tab, setTab] = useState<"public" | "vip">("public");
  const { vip } = useAppState();
  const me = profiles[0];

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Perfil" />

      <div className="relative mx-4 h-32 overflow-hidden rounded-3xl">
        <img
          src={photos.p1}
          alt="Capa do perfil"
          width={768}
          height={1024}
          className="size-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="-mt-10 flex flex-col items-center px-4">
        <span className="ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold">
          <img
            src={me.photo}
            alt={me.name}
            width={768}
            height={1024}
            className="size-full rounded-full object-cover"
          />
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <h2 className="text-xl font-extrabold">
            {me.name}, {me.age}
          </h2>
          <Crown className="size-4 text-gold" fill="currentColor" />
        </div>
        <span className="mt-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
          {vip ? "VIP Gold ativo" : "Criadora Verificada"}
        </span>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">{me.bio}</p>
      </div>

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
          ? publicGallery.map((src, i) => (
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
          : vipGallery.map((m, i) => (
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

      <ul className="mx-4 mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
        {[
          { icon: Settings, label: "Editar perfil e fotos" },
          { icon: Shield, label: "Privacidade e verificação" },
          { icon: Crown, label: "Gerenciar assinatura VIP" },
          { icon: HelpCircle, label: "Suporte HotMatch" },
        ].map(({ icon: Icon, label }) => (
          <li key={label}>
            <button className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-0 active:bg-surface-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      <button className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground">
        <LogOut className="size-4" />
        Sair da conta
      </button>
    </div>
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
