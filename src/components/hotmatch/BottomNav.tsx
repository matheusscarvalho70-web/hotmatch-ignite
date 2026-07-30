import { Link } from "@tanstack/react-router";
import { Flame, LayoutGrid, MessageCircle, Store, User } from "lucide-react";

const items = [
  { to: "/", label: "Descobrir", icon: Flame },
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/loja", label: "Loja", icon: Store },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="glass-panel pointer-events-auto flex w-[min(26rem,calc(100%-1.5rem))] items-center justify-between rounded-3xl px-2 py-2 shadow-card-premium">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group tap-scale relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-muted-foreground data-[status=active]:text-foreground"
          >
            <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-hot opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
            <Icon
              className="size-5 transition-transform group-data-[status=active]:scale-110 group-data-[status=active]:text-primary"
              strokeWidth={2}
            />
            <span className="truncate text-[10px] font-medium tracking-tight">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
