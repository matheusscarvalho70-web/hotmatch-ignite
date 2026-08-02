import { useEffect, useState } from "react";
import { supabase, type DbNotification } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export function useNotifications() {
  const { profileId } = useAppState();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setNotifications([]); setLoading(false); return; }
    let cancelled = false;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!cancelled) {
          if (!error && data) setNotifications(data as DbNotification[]);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(`notif:${profileId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${profileId}`,
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
      .eq("user_id", profileId).eq("is_read", false);
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  }

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
