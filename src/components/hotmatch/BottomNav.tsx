import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutGrid, MessageCircle, Store, User } from "lucide-react";
import { HotMark } from "@/components/hotmatch/HotMark";
import { useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

const items = [
  { to: "/", label: "Descobrir", icon: (props: { className?: string }) => <HotMark {...props} /> },
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/loja", label: "Loja", icon: Store },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { profileId, unreadUsersCount, setUnreadUsersCount } = useAppState();

  // Escuta em tempo real o número de usuários únicos que mandaram mensagens não lidas
  useEffect(() => {
    if (!profileId) {
      setUnreadUsersCount(0);
      return;
    }

    const fetchUnreadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("sender_id")
          .eq("receiver_id", profileId)
          .eq("is_read", false);

        if (!error && data) {
          // O Set garante que se o mesmo usuário mandar 50 mensagens, conte apenas como 1 usuário
          const uniqueUsers = new Set(data.map((msg) => msg.sender_id)).size;
          setUnreadUsersCount(uniqueUsers);
        }
      } catch (err) {
        console.warn("Erro ao buscar usuários não lidos:", err);
      }
    };

    fetchUnreadUsers();

    // Canal em tempo real do Supabase para escutar novas mensagens ou leituras globalmente
    const channel = supabase
      .channel(`global:bottom_nav:unread:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Escuta INSERT e UPDATE para atualizar em tempo real
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, setUnreadUsersCount]);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="glass-panel pointer-events-auto flex w-[min(26rem,calc(100%-1.5rem))] items-center justify-between rounded-3xl px-2 py-2 shadow-card-premium">
        {items.map(({ to, label, icon: Icon }) => {
          const isMessages = to === "/mensagens";

          return (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group tap-scale relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-muted-foreground data-[status=active]:text-foreground"
            >
              <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-hot opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
              
              <div className="relative">
                <Icon
                  className="size-5 transition-transform group-data-[status=active]:scale-110 group-data-[status=active]:text-primary"
                  strokeWidth={2}
                />
                
                {/* Bolinha vermelha com a quantidade de usuários únicos em tempo real */}
                {isMessages && unreadUsersCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 grid min-w-5 h-5 px-1 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background animate-pulse">
                    {unreadUsersCount > 9 ? "9+" : unreadUsersCount}
                  </span>
                )}
              </div>

              <span className="truncate text-[10px] font-medium tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
