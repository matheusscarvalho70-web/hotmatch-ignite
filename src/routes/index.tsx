import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { BadgeCheck, Crown, Heart, MapPin, RotateCcw, Star, X } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hotmatch/TopBar";
import { profiles, type Profile } from "@/lib/hotmatch/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HotMatch — Paquera local com match instantâneo" },
      {
        name: "description",
        content:
          "Deslize, dê match com pessoas perto de você e desbloqueie conteúdos exclusivos das criadoras no HotMatch.",
      },
      { property: "og:title", content: "HotMatch — Paquera local com match instantâneo" },
      {
        property: "og:description",
        content: "Match, feed exclusivo, mimos em moedas e criadoras verificadas.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [index, setIndex] = useState(0);
  const deck = useMemo(() => [...profiles, ...profiles.map((p) => ({ ...p, id: p.id + "b" }))], []);
  const current = deck[index];
  const next = deck[index + 1];

  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<"left" | "right" | "up" | null>(null);
  const start = useRef({ x: 0, y: 0 });

  function decide(dir: "left" | "right" | "up") {
    setLeaving(dir);
    if (dir === "right") toast("Curtida enviada 💗", { description: `Você curtiu ${current.name}` });
    if (dir === "up")
      toast("Super Like ⭐", { description: `${current.name} vai ver seu Super Like primeiro` });
    setTimeout(() => {
      setLeaving(null);
      setDrag({ x: 0, y: 0, active: false });
      setIndex((i) => (i + 1 < deck.length ? i + 1 : 0));
    }, 260);
  }

  const rotate = drag.x / 18;
  const transform = leaving
    ? leaving === "up"
      ? "translate3d(0,-120%,0) scale(0.9)"
      : `translate3d(${leaving === "right" ? 120 : -120}%,0,0) rotate(${leaving === "right" ? 18 : -18}deg)`
    : `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotate}deg)`;

  return (
    <div className="min-h-screen pb-32">
      <TopBar />

      <div className="relative mx-4 h-[68vh] min-h-[26rem] select-none">
        {next && <CardShell profile={next} className="scale-[0.94] opacity-60" />}
        <div
          className="absolute inset-0 touch-none"
          style={{
            transform,
            transition: drag.active ? "none" : "transform 260ms cubic-bezier(.2,.8,.2,1)",
          }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            start.current = { x: e.clientX, y: e.clientY };
            setDrag({ x: 0, y: 0, active: true });
          }}
          onPointerMove={(e) => {
            if (!drag.active) return;
            setDrag({
              x: e.clientX - start.current.x,
              y: e.clientY - start.current.y,
              active: true,
            });
          }}
          onPointerUp={() => {
            if (!drag.active) return;
            if (drag.y < -110 && Math.abs(drag.x) < 90) decide("up");
            else if (drag.x > 110) decide("right");
            else if (drag.x < -110) decide("left");
            else setDrag({ x: 0, y: 0, active: false });
          }}
        >
          <CardShell profile={current} stamp={drag.x} stampUp={drag.y} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          onClick={() => setIndex((i) => (i > 0 ? i - 1 : i))}
          className="tap-scale grid size-12 place-items-center rounded-full border border-border bg-surface text-muted-foreground"
          aria-label="Voltar"
        >
          <RotateCcw className="size-5" />
        </button>
        <button
          onClick={() => decide("left")}
          className="tap-scale grid size-16 place-items-center rounded-full border border-border bg-surface text-foreground shadow-card-premium"
          aria-label="Passar"
        >
          <X className="size-7" />
        </button>
        <button
          onClick={() => decide("up")}
          className="tap-scale grid size-14 place-items-center rounded-full bg-gradient-gold shadow-gold"
          aria-label="Super Like"
        >
          <Star className="size-6 text-gold-foreground" fill="currentColor" />
        </button>
        <button
          onClick={() => decide("right")}
          className="tap-scale grid size-16 place-items-center rounded-full bg-gradient-hot shadow-hot"
          aria-label="Curtir"
        >
          <Heart className="size-7 text-primary-foreground" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function CardShell({
  profile,
  className = "",
  stamp = 0,
  stampUp = 0,
}: {
  profile: Profile;
  className?: string;
  stamp?: number;
  stampUp?: number;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[2rem] bg-surface shadow-card-premium ${className}`}
    >
      <img
        src={profile.photo}
        alt={`Foto de ${profile.name}`}
        width={768}
        height={1024}
        className="size-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

      {profile.verified && (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/50 px-2.5 py-1 backdrop-blur-md">
          {profile.creator ? (
            <Crown className="size-3.5 text-gold" fill="currentColor" />
          ) : (
            <BadgeCheck className="size-3.5 text-gold" />
          )}
          <span className="text-[11px] font-semibold text-gold">
            {profile.creator ? "Criadora VIP" : "Verificada"}
          </span>
        </div>
      )}

      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md">
        <MapPin className="size-3.5 text-foreground/80" />
        <span className="text-[11px] font-medium text-foreground/90">{profile.distance}</span>
      </div>

      {stamp > 40 && (
        <Stamp label="LIKE" tone="hot" style={{ opacity: Math.min(1, stamp / 120) }} left />
      )}
      {stamp < -40 && <Stamp label="NOPE" tone="mute" style={{ opacity: Math.min(1, -stamp / 120) }} />}
      {stampUp < -60 && (
        <Stamp label="SUPER" tone="gold" style={{ opacity: Math.min(1, -stampUp / 120) }} center />
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-end gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight">{profile.name}</h2>
          <span className="pb-0.5 text-xl font-light text-foreground/80">{profile.age}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-foreground/75">{profile.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-foreground/90 backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stamp({
  label,
  tone,
  style,
  left,
  center,
}: {
  label: string;
  tone: "hot" | "gold" | "mute";
  style?: React.CSSProperties;
  left?: boolean;
  center?: boolean;
}) {
  const tones = {
    hot: "border-primary text-primary",
    gold: "border-gold text-gold",
    mute: "border-foreground/70 text-foreground/80",
  };
  const pos = center
    ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    : left
      ? "left-6 top-24 -rotate-12"
      : "right-6 top-24 rotate-12";
  return (
    <span
      style={style}
      className={`absolute ${pos} rounded-xl border-4 px-3 py-1 text-2xl font-black tracking-widest ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
