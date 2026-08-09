import { useEffect, useState } from "react";
import { supabase, type DbNotification } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export function useNotifications() {
  const { profileId } = useAppState();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(false); // Já começa como false para não travar a tela

  useEffect(() => {
    let cancelled = false;

    // Busca todas as notificações do banco para teste imediato
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (!cancelled) {
          if (!error && data) {
            setNotifications(data as DbNotification[]);
          }
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  async function markAllRead() {
    if (!profileId) return;
    await supabase.from("notifications").update({ is_read: true })
      .eq("user_id", profileId).eq("is_read", false);
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  }

  return {
    notifications,
    loading: false, // Força a nunca bloquear a interface
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
