import { Link } from "@tanstack/react-router";
import { LayoutGrid, MessageCircle, Store, User, Flame } from "lucide-react";
import { useAppState } from "@/lib/hotmatch/store";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function BottomNav() {
  const { profileId } = useAppState();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profileId) return;

    async function fetchCount() {
      // Agora consultamos a tabela 'notifications' como nas suas fotos
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileId) // Filtra pelo seu ID
        .eq("is_read", false);    // Filtra pelo que ainda não foi lido

      setUnreadCount(count || 0);
    }

    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Polling a cada 5s
    return () => clearInterval(interval);
  }, [profileId]);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] px-4">
      <div className="glass-panel pointer-events-auto mb-4 flex w-[min(26rem,calc(100%-1.5rem))] items-center justify-between rounded-full bg-background/90 px-2 py-2 shadow-2xl backdrop-blur-xl border border-white/10">
        <Link to="/" className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary"><Flame className="h-6 w-6" />Descobrir</Link>
        <Link to="/feed" className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary"><LayoutGrid className="h-6 w-6" />Feed</Link>
        
        {/* Ícone de mensagens com a contagem da tabela notifications */}
        <Link to="/mensagens" className="relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary">
          <div className="relative p-1">
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-md ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          Mensagens
        </Link>

        <Link to="/loja" className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary"><Store className="h-6 w-6" />Loja</Link>
        <Link to="/perfil" className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary"><User className="h-6 w-6" />Perfil</Link>
      </div>
    </nav>
  );
}
