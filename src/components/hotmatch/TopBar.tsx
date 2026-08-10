import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Coins, Crown, X, Zap } from "lucide-react";
import { Component, useEffect, useState, type ReactNode } from "react";
import { HotMark } from "@/components/hotmatch/HotMark";
import { useNotifications } from "@/hooks/use-notifications";
import { useAppState, actions } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";
import type { DbNotification } from "@/lib/supabase";

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

function GamificationModal({ onClose }: { onClose: () => void }) {
  const { xp, level, earnings, profileId } = useAppState();
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    supabase
      .from("feed_posts")
      .select("id", { count: "exact" })
      .eq("author_id", profileId)
      .then(({ count }) => { if (count != null) setPostCount(count); });
  }, [profileId]);

  const LEVEL_XP: Record<string, number> = { bronze: 1000, silver: 5000, gold: 10000, platinum: 25000 };
  const NEXT_LEVEL: Record<string, string> = { bronze: "Prata", silver: "Ouro", gold: "Platina", platinum: "Platina" };
  const nextXP = LEVEL_XP[level] ?? 1000;
  const pct = Math.min(100, Math.round((xp / nextXP) * 100));
  const levelLabel: Record<string, string> = { bronze: "Bronze", silver: "Prata", gold: "Ouro", platinum: "Platina" };

  const achievements = [
    { emoji: "📸", label: `${postCount} post${postCount !== 1 ? "s" : ""} publicado${postCount !== 1 ? "s" : ""}`, done: postCount > 0 },
    { emoji: "💸", label: earnings > 0 ? `R$\u00a0${earnings.toFixed(2).replace(".", ",")} ganhos` : "Nenhum ganho ainda", done: earnings > 0 },
    { emoji: "👑", label: `Nível ${NEXT_LEVEL[level] ?? "Platina"} (${nextXP.toLocaleString("pt-BR")} XP)`, done: false },
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
              <h2 className="text-xl font-extrabold text-gold">{levelLabel[level] ?? level}</h2>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground">{xp.toLocaleString("pt-BR")} XP</span>
              <span className="text-gold">próximo: {nextXP.toLocaleString("pt-BR")} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {pct}% para Nível {NEXT_LEVEL[level] ?? "Platina"}
            </p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Conquistas</p>
          <ul className="space-y-2">
            {achievements.map((a) => (
              <li
                key={a.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                  a.done ? "border border-gold/20 bg-gold/8" : "border border-border bg-surface-2"
                }`}
              >
                <span className="text-lg">{a.emoji}</span>
                <span className={`flex-1 font-medium ${a.done ? "text-foreground" : "text-muted-foreground"}`}>
                  {a.label}
                </span>
                {a.done && <CheckCheck className="size-4 shrink-0 text-gold" />}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/8 px-3 py-2.5">
            <Zap className="size-4 text-primary" />
            <p className="text-xs font-semibold text-primary">
              Publique conteúdo VIP para ganhar XP e subir de nível
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const UNLOCK_COST = 15;

function LockedLikeRow({ n }: { n: DbNotification }) {
  const { vip, coins } = useAppState();
  const [unlocked, setUnlocked] = useState(false);

  function handleUnlock() {
    if (vip) { setUnlocked(true); return; }
    const ok = actions.spendCoins(UNLOCK_COST);
    if (ok) { setUnlocked(true); }
    else {
      import("sonner").then(({ toast }) =>
        toast.error(`Saldo insuficiente (${coins}/${UNLOCK_COST} moedas)`)
      );
    }
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative shrink-0">
        {n.actor_avatar_url ? (
          <img
            src={n.actor_avatar_url}
            alt=""
            className={`size-10 rounded-full object-cover transition-all duration-300 ${
              unlocked ? "" : "blur-md brightness-75"
            }`}
          />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-xl">
            {unlocked ? "❤️" : "🔒"}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {unlocked ? (
          <>
            <p className="text-sm font-semibold">{n.title ?? "Nova curtida"}</p>
            <p className="text-xs text-muted-foreground">{n.content ?? ""}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">Alguém te curtiu 🔥</p>
            <p className="mb-2 text-xs text-muted-foreground">Desbloqueie para ver quem foi</p>
            <button
              onClick={handleUnlock}
              className="flex items-center gap-1.5 rounded-full bg-gradient-hot px-3 py-1 text-[11px] font-bold text-white shadow-hot"
            >
              <Coins className="size-3" />
              {vip ? "Ver grátis (VIP)" : `Ver por ${UNLOCK_COST} moedas`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NotificationsDrawer({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { notifications, loading } = useNotifications();
  const { gender } = useAppState();

  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  
  // FILTRO RIGOROSO: Remove completamente qualquer notificação de mensagem do sininho
  const generalNotifs = safeNotifs.filter((n) => {
    const type = n.type?.toLowerCase();
    return type !== "message" && type !== "msg" && type !== "chat";
  });

  const isMale = gender === "male";

  if (loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <div
        className="fixed inset-x-0 top-0 z-[56] mx-auto max-w-[30rem] overflow-y-auto rounded-b-3xl border-b border-x border-border bg-background shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        style={{ maxHeight: "80dvh", paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
      >
        <div className="space-y-4 p-4 pb-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-extrabold">Notificações</h3>
            <button onClick={onClose} className="grid size-7 place-items-center rounded-full bg-surface-2">
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          {generalNotifs.length > 0 ? (
            <div className="divide-y divide-border/50">
              {generalNotifs.map((n) => {
                const type = n.type?.toLowerCase();

                if (type === "like" && isMale) {
                  return <LockedLikeRow key={n.id} n={n} />;
                }

                let clickAction = () => {
                  onClose();
                  navigate({ to: "/mensagens" });
                };

                if (type === "match") {
                  const targetUserId = n.actor_id || n.sender_id;
                  if (targetUserId) {
                    clickAction = () => {
                      onClose();
                      navigate({ to: "/mensagens/$userId", params: { userId: targetUserId } });
                    };
                  }
                }

                const defaultEmoji = type === "match" ? "🔥" : type === "welcome" ? "🎉" : type === "feed" ? "📸" : "🔔";

                return (
                  <div
                    key={n.id}
                    onClick={clickAction}
                    className="flex items-center gap-3.5 py-3.5 transition-colors hover:bg-surface-2/40 cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      {n.actor_avatar_url ? (
                        <img
                          src={n.actor_avatar_url}
                          alt=""
                          className="size-11 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <span className="grid size-11 place-items-center rounded-full bg-surface-2 text-xl">
                          {defaultEmoji}
                        </span>
                      )}
                      {!n.is_read && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-foreground">
                          {n.title ?? "Notificação"}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground mt-0.5">
                        {n.content ?? ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-surface-2">
                <Bell className="size-6 text-muted-foreground" />
              </span>
              <p className="text-sm font-semibold">Nenhuma notificação por enquanto</p>
              <p className="text-xs text-muted-foreground">Suas curtidas, matches e avisos aparecerão aqui.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

class NotifErrorBoundary extends Component<
  { children: ReactNode; onClose: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.warn("[NotifBoundary]", err); }
  render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="fixed inset-0 z-[55]" onClick={this.props.onClose} />
          <div
            className="fixed inset-x-0 top-0 z-[56] mx-auto max-w-[30rem] overflow-y-auto rounded-b-3xl border-b border-x border-border bg-background shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
            style={{ maxHeight: "80dvh", paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
          >
            <div className="p-4 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">Notificações</h3>
                <button onClick={this.props.onClose} className="grid size-7 place-items-center rounded-full bg-surface-2">
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-surface-2">
                  <Bell className="size-6 text-muted-foreground" />
                </span>
                <p className="text-sm font-semibold">Nenhuma notificação no momento</p>
                <p className="text-xs text-muted-foreground">Volte mais tarde para ver suas atualizações.</p>
              </div>
            </div>
          </div>
        </>
      );
    }
    return this.props.children;
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markAllRead } = useNotifications();

  // FILTRA APENAS AS NÃO LIDAS QUE NÃO SEJAM MENSAGENS DE CHAT
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const generalUnreadCount = safeNotifs.filter((n) => {
    const type = n.type?.toLowerCase();
    return !n.is_read && type !== "message" && type !== "msg" && type !== "chat";
  }).length;

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && generalUnreadCount > 0) markAllRead();
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="tap-scale relative grid size-9 place-items-center rounded-full border border-border bg-surface-2"
      >
        <Bell className="size-4 text-foreground" />
        {generalUnreadCount > 0 && (
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-extrabold text-primary-foreground ring-2 ring-background">
            {generalUnreadCount > 9 ? "9+" : generalUnreadCount}
          </span>
        )}
      </button>
      {open && (
        <NotifErrorBoundary onClose={() => setOpen(false)}>
          <NotificationsDrawer onClose={() => setOpen(false)} />
        </NotifErrorBoundary>
      )}
    </>
  );
}

export function TopBar() {
  const { gender } = useAppState();
  const [showGamification, setShowGamification] = useState(false);
  const isMale = gender === "male";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <HotMark />
      </div>

      <div className="flex items-center gap-2">
        {isMale ? (
          <CoinBadge />
        ) : (
          <CreatorBadge onClick={() => setShowGamification(true)} />
        )}
        <NotificationBell />
      </div>

      {showGamification && (
        <GamificationModal onClose={() => setShowGamification(false)} />
      )}
    </header>
  );
      }
          
