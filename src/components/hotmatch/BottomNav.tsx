import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutGrid, MessageCircle, Store, User, Flame } from "lucide-react";
import { useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

const items = [
  { to: "/", label: "Descobrir", icon: Flame },
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/loja", label: "Loja", icon: Store },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { profileId, unreadUsersCount, setUnreadUsersCount } = useAppState();

  useEffect(() => {
    if (!profileId) {
      setUnreadUsersCount(0);
      return;
    }

    const fetchGlobalUnread = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("sender_id")
          .eq("receiver_id", profileId)
          .eq("is_read", false);

        if (!error && data) {
          const uniqueSenders = new Set(data.map((msg: { sender_id: string }) => msg.sender_id)).size;
          setUnreadUsersCount(uniqueSenders);
        }
      } catch (err) {
        console.warn("Erro ao buscar mensagens globais não lidas:", err);
      }
    };

    fetchGlobalUnread();

    const channel = supabase
      .channel(`global-bottom-nav-unread-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${profileId}`,
        },
        () => {
          fetchGlobalUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, setUnreadUsersCount]);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-4">
      <div className="glass-panel pointer-events-auto flex w-[min(26rem,calc(100%-1.5rem))] items-center justify-between rounded-full px-2 py-1.5 shadow-lg backdrop-blur-md">
        {items.map(({ to, label, icon: Icon }) => {
          const isMessages = to === "/mensagens";

          return (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group tap-scale relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary"
            >
              <div className="relative flex items-center justify-center">
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                
                {isMessages && unreadUsersCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow">
                    {unreadUsersCount > 9 ? "9+" : unreadUsersCount}
                  </span>
                )}
              </div>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
