import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Crown, Heart, MapPin, RotateCcw, Sparkles, Star, X } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hotmatch/TopBar";
import { useProfiles } from "@/hooks/use-profiles";
import { useAppState } from "@/lib/hotmatch/store";
import type { DbProfile } from "@/lib/supabase";

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
      { property: "og:description", content: "Match, feed exclusivo, mimos em moedas e criadoras verificadas." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { profileId } = useAppState();
  const navigate = useNavigate();
  const { profiles, loading } = useProfiles();

  // Show only profiles that are NOT the current user and are female (for male buyer) or male (for female creator)
  const deck = useMemo(() => {
    if (!profiles.length) return [];
    return profiles.filter((p) => p.id !== profileId && p.gender === "female");
  }, [profiles, profileId]);

  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<"left" | "right" | "up" | null>(null);
  const start = useRef({ x: 0, y: 0 });

  // Auth guard: redirect to onboarding if not logged in
  useEffect(() => {
    if (!profileId) navigate({ to: "/bem-vindo", replace: true });
  }, [profileId, navigate]);

  const current = deck[index % Math.max(deck.length, 1)];
  const next = deck[(index + 1) % Math.max(deck.length, 1)];

  function decide(dir: "left" | "right" | "up") {
    if (!current) return;
    setLeaving(dir);
    if (dir === "right") toast("Curtida enviada 💗", { description: `Você curtiu ${current.name}` });
    if (dir === "up") toast("Super Like ⭐", { description: `${current.name} vai ver seu Super Like primeiro` });
    setTimeout(() => {
      setLeaving(null);
      setDrag({ x: 0, y: 0, active: false });
      setIndex((i) => i + 1);
    }, 260);
  }

  const rotate = drag.x / 18;
  const transform = leaving
    ? leaving === "up"
      ? "translate3d(0,-120%,0) scale(0.9)"
      : `translate3d(${leaving === "right" ? 120 : -120}%,0,0) rotate(${leaving === "right" ? 18 : -18}deg)`
    : `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotate}deg)`;

  if (!profileId) return null;

  if (loading) {
    return (
      <div className="min-h-screen pb-32">
        <TopBar />
        <div className="mx-4 mt-4 h-[68vh] min-h-[26rem] animate-pulse rounded-[2rem] bg-surface-2" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen pb-32">
        <TopBar />
        <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-surface-2">
            <Sparkles className="size-9 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold">Nenhum perfil por enquanto</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Novos perfis aparecerão aqui em breve. Volte mais tarde ou convide amigos!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <TopBar />
      <div className="relative mx-4 h-[68vh] min-h-[26rem] select-none">
        {next && next.id !== current.id && (
          <CardShell profile={next} className="scale-[0.94] opacity-60" />
        )}
        <div
          className="absolute inset-0 touch-none"
          style={{ transform, transition: drag.active ? "none" : "transform 260ms cubic-bezier(.2,.8,.2,1)" }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            start.current = { x: e.clientX, y: e.clientY };
            setDrag({ x: 0, y: 0, active: true });
          }}
          onPointerMove={(e) => {
            if (!drag.active) return;
            setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true });
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
        >
          <RotateCcw className="size-5" />
        </button>
        <button
          onClick={() => decide("left")}
          className="tap-scale grid size-16 place-items-center rounded-full border border-border bg-surface text-foreground shadow-card-premium"
        >
          <X className="size-7" />
        </button>
        <button
          onClick={() => decide("up")}
          className="tap-scale grid size-14 place-items-center rounded-full bg-gradient-gold shadow-gold"
        >
          <Star className="size-6 text-gold-foreground" fill="currentColor" />
        </button>
        <button
          onClick={() => decide("right")}
          className="tap-scale grid size-16 place-items-center rounded-full bg-gradient-hot shadow-hot"
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
  profile: DbProfile;
  className?: string;
  stamp?: number;
  stampUp?: number;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-[2rem] bg-surface shadow-card-premium ${className}`}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={`Foto de ${profile.name}`}
          width={768}
          height={1024}
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="size-full bg-gradient-to-br from-surface-2 to-surface" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

      {profile.is_verified && (
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/50 px-2.5 py-1 backdrop-blur-md">
          <Crown className="size-3.5 text-gold" fill="currentColor" />
          <span className="text-[11px] font-semibold text-gold">Verificada</span>
        </div>
      )}

      {profile.location && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md">
          <MapPin className="size-3.5 text-foreground/80" />
          <span className="text-[11px] font-medium text-foreground/90">{profile.location}</span>
        </div>
      )}

      {stamp > 40 && (
        <Stamp label="LIKE" tone="hot" style={{ opacity: Math.min(1, stamp / 120) }} left />
      )}
      {stamp < -40 && (
        <Stamp label="NOPE" tone="mute" style={{ opacity: Math.min(1, -stamp / 120) }} />
      )}
      {stampUp < -60 && (
        <Stamp label="SUPER" tone="gold" style={{ opacity: Math.min(1, -stampUp / 120) }} center />
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-end gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight">{profile.name}</h2>
          <span className="pb-0.5 text-xl font-light text-foreground/80">{profile.age}</span>
          {profile.is_verified && <BadgeCheck className="mb-0.5 size-5 text-gold" fill="currentColor" />}
        </div>
        {profile.bio && (
          <p className="mt-1.5 line-clamp-2 text-sm text-foreground/75">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}

function Stamp({ label, tone, style, left, center }: {
  label: string; tone: "hot" | "gold" | "mute";
  style?: React.CSSProperties; left?: boolean; center?: boolean;
}) {
  const tones = { hot: "border-primary text-primary", gold: "border-gold text-gold", mute: "border-foreground/70 text-foreground/80" };
  const pos = center ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    : left ? "left-6 top-24 -rotate-12" : "right-6 top-24 rotate-12";
  return (
    <span style={style} className={`absolute ${pos} rounded-xl border-4 px-3 py-1 text-2xl font-black tracking-widest ${tones[tone]}`}>
      {label}
    </span>
  );
}
