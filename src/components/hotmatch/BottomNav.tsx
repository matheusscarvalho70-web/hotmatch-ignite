import { Link } from "@tanstack/react-router";
import { LayoutGrid, MessageCircle, Store, User, Flame } from "lucide-react";
import { useAppState, refreshUnreadUsersCount } from "@/lib/hotmatch/store";
import { useEffect } from "react";

const items = [
  { to: "/", label: "Descobrir", icon: Flame },
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/loja", label: "Loja", icon: Store },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { unreadUsersCount } = useAppState();

  // Polling agressivo: verifica a cada 5 segundos se há mensagens novas
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnreadUsersCount();
    }, 5000);
    
    // Verifica uma vez assim que montar o componente
    refreshUnreadUsersCount();

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] px-4">
      <div className="glass-panel pointer-events-auto mb-4 flex w-[min(26rem,calc(100%-1.5rem))] items-center justify-between rounded-full bg-background/90 px-2 py-2 shadow-2xl backdrop-blur-xl border border-white/10">
        {items.map(({ to, label, icon: Icon }) => {
          const isMessages = to === "/mensagens";

          return (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground transition-all hover:text-primary [&.active]:text-primary"
            >
              <div className="relative flex items-center justify-center p-1">
                <Icon className="h-6 w-6" strokeWidth={2} />
                {isMessages && unreadUsersCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-md ring-2 ring-background">
                    {unreadUsersCount > 9 ? "9+" : unreadUsersCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
