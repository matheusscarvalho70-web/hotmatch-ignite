import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Coins, Crown, Heart, MessageCircle, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";
import { HotMark } from "@/components/hotmatch/HotMark";
import { photos, profiles } from "@/lib/hotmatch/data";
import { useAppState } from "@/lib/hotmatch/store";

/* ------------------------------------------------------------------ */
/*  Coin Badge (male)                                                    */
/* ------------------------------------------------------------------ */
export function CoinBadge() {
  const { coins } = useAppState();
  return (
    <Link
      to="/loja"
      className="tap-scale flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5"
    >
      <Coins className="size-4 text-gold" />
      <span className="text-sm font-bold text-gold tabular-nums">{coins}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Creator Badge (female)                                              */
/* ------------------------------------------------------------------ */
function CreatorBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap-scale relative flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.86 0.16 92 / 0.12), oklch(0.7 0.22 10 / 0.12))",
        boxShadow: "0 0 12px oklch(0.86 0.16 92 / 0.35), 0 0 4px oklch(0.7 0.22 10 / 0.2)",
        border: "1px solid oklch(0.86 0.16 92 / 0.45)",
      }}
    >
      <Crown className="size-3.5 text-gold" fill="currentColor" />
      <span className="text-xs font-extrabold text-gold">Nível Ouro</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Gamification Modal (female)                                         */
/* ------------------------------------------------------------------ */
function GamificationModal({ onClose }: { onClose: () => void }) {
  const XP = 7200;
  const NEXT = 10000;
  const pct = Math.round((XP / NEXT) * 100);

  const achievements = [
    { emoji: "🔥", label: "42 posts publicados", done: true },
    { emoji: "👥", label: "1.840 seguidores", done: true },
    { emoji: "💸", label: "R$ 2.480 ganhos", done: true },
    { emoji: "👑", label: "Nível Platina (10k XP)", done: false },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[22rem] overflow-hidden rounded-3xl border border-gold/30 bg-surface"
        style={{ boxShadow: "0 0 40px oklch(0.86 0.16 92 / 0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-gold/20 via-pink-500/10 to-transparent p-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-surface-2/80"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-gold/15">
              <Crown className="size-7 text-gold" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Status da Criadora
              </p>
              <h2 className="text-xl font-extrabold text-gold">Nível Ouro</h2>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground">
                {XP.toLocaleString("pt-BR")} XP
              </span>
              <span className="text-gold">
                próximo: {NEXT.toLocaleString("pt-BR")} XP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {pct}% para Nível Platina
            </p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Conquistas
          </p>
          <ul className="space-y-2">
            {achievements.map((a) => (
              <li
                key={a.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                  a.done
                    ? "border border-gold/20 bg-gold/8"
                    : "border border-border bg-surface-2"
                }`}
              >
                <span className="text-lg">{a.emoji}</span>
                <span
                  className={`flex-1 font-medium ${a.done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {a.label}
                </span>
                {a.done && (
                  <CheckCheck className="size-4 shrink-0 text-gold" />
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/8 px-3 py-2.5">
            <Zap className="size-4 text-primary" />
            <p className="text-xs font-semibold text-primary">
              Publique 2 conteúdos VIP esta semana para ganhar +300 XP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notifications Drawer                                                */
/* ------------------------------------------------------------------ */
function NotificationsDrawer({ onClose }: { onClose: () => void }) {
  const { gender, vip } = useAppState();
  const navigate = useNavigate();
  const isMale = gender === "male";

  const messages = [
    { profile: profiles[0], text: "Te mandei uma mídia privada 😏", time: "há 5 min" },
    { profile: profiles[2], text: "Adorei o mimo, obrigada!", time: "há 23 min" },
  ];
  const matches = [
    { profile: profiles[1], time: "há 1 h" },
    { profile: profiles[3], time: "há 2 h" },
  ];
  const likers = [profiles[0], profiles[2], profiles[3]];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-x-0 top-0 z-[56] mx-auto max-w-[30rem] overflow-y-auto rounded-b-3xl border-b border-x border-border bg-background shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        style={{ maxHeight: "80dvh", paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
      >
        <div className="space-y-4 p-4 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold">Notificações</h3>
            <button
              onClick={onClose}
              className="grid size-7 place-items-center rounded-full bg-surface-2"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          {/* New Messages */}
          <Section title="Novas mensagens" icon={<MessageCircle className="size-3.5 text-primary" />}>
            {messages.map((m, i) => (
              <button
                key={i}
                onClick={() => {
                  onClose();
                  navigate({ to: "/mensagens/$chatId", params: { chatId: m.profile.id } });
                }}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <img
                  src={m.profile.photo}
                  alt={m.profile.name}
                  className="size-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.profile.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.text}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{m.time}</span>
              </button>
            ))}
          </Section>

          {/* New Matches */}
          <Section title="Novos matches" icon={<Heart className="size-3.5 text-primary" />}>
            {matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="ring-match grid size-10 place-items-center rounded-full p-[2px] shrink-0">
                  <img
                    src={m.profile.photo}
                    alt={m.profile.name}
                    className="size-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.profile.name}</p>
                  <p className="text-xs text-muted-foreground">{m.time}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Match!
                </span>
              </div>
            ))}
          </Section>

          {/* Who liked your profile */}
          <Section title="Quem curtiu seu perfil" icon={<Sparkles className="size-3.5 text-gold" />}>
            <div className="flex items-center gap-2 py-3">
              {likers.map((p, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={p.photo}
                    alt={p.name}
                    className={`size-12 rounded-full object-cover ${isMale && !vip ? "blur-md brightness-50" : ""}`}
                  />
                  {isMale && !vip && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg">❓</span>
                    </div>
                  )}
                </div>
              ))}
              {isMale && !vip && (
                <div className="ml-1 text-xs font-semibold text-muted-foreground">
                  +{Math.floor(3 + Math.random() * 5)} outros
                </div>
              )}
            </div>
            {isMale && !vip && (
              <button
                onClick={() => {
                  onClose();
                  navigate({ to: "/loja" });
                }}
                className="tap-scale mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-2.5 text-xs font-extrabold text-gold-foreground shadow-gold"
              >
                <Crown className="size-4" />
                Desbloquear com moedas ou Seja VIP
              </button>
            )}
            {(!isMale || vip) && (
              <p className="pb-3 text-xs text-muted-foreground">
                {likers.length} pessoas curtiram seu perfil nas últimas 24h.
              </p>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        {icon}
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="divide-y divide-border px-4">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification Bell                                                   */
/* ------------------------------------------------------------------ */
function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap-scale relative grid size-9 place-items-center rounded-full border border-border bg-surface-2"
      >
        <Bell className="size-4 text-foreground" />
        {/* Unread dot */}
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
      </button>
      {open && <NotificationsDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  TopBar                                                              */
/* ------------------------------------------------------------------ */
export function TopBar({ title, right }: { title?: string; right?: React.ReactNode }) {
  const { gender } = useAppState();
  const [gamificationOpen, setGamificationOpen] = useState(false);
  const isCreator = gender === "female";

  const defaultRight = isCreator ? (
    <CreatorBadge onClick={() => setGamificationOpen(true)} />
  ) : (
    <CoinBadge />
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-gradient-to-b from-background via-background/90 to-transparent px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl border border-gold/25 bg-surface-2/80 shadow-hot">
            <HotMark className="size-5" />
          </span>
          <h1 className="truncate text-lg font-extrabold tracking-tight">
            {title ?? (
              <>
                Hot<span className="text-gradient-gold">Match</span>
              </>
            )}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          {right ?? defaultRight}
        </div>
      </header>
      {gamificationOpen && (
        <GamificationModal onClose={() => setGamificationOpen(false)} />
      )}
    </>
  );
}
