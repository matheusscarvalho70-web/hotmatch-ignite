import { useEffect, useState } from "react";
import { supabase, type DbNotification } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export function useNotifications() {
  const { profileId } = useAppState();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vamos testar se o profileId existe
    if (!profileId) { 
      console.log("ERRO: profileId está vazio!");
      setNotifications([]); 
      setLoading(false); 
      return; 
    }

    let cancelled = false;

    // Removemos temporariamente o filtro de user_id para testar se *qualquer* notificação aparece
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!cancelled) {
          if (error) {
            console.log("Erro do Supabase:", error.message);
          } else {
            console.log("Notificações encontradas na tabela inteira:", data);
            if (data) setNotifications(data as DbNotification[]);
          }
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(`notif:global-debug`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications"
      }, (payload) => {
        if (!cancelled) setNotifications((p) => [payload.new as DbNotification, ...p]);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  async function markAllRead() {
    if (!profileId) return;
    await supabase.from("notifications").update({ is_read: true })
      .eq("user_id", profileId).eq("is_read: false", false);
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  }

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
