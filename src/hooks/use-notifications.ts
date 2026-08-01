import { useEffect, useState } from "react";
import { supabase, type DbNotification } from "@/lib/supabase";
import { DEMO_IDS } from "@/lib/hotmatch/demo";
import { useAppState } from "@/lib/hotmatch/store";

export function useNotifications() {
  const { gender } = useAppState();
  const userId = DEMO_IDS[gender];
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!cancelled) {
        if (!error && data) setNotifications(data as DbNotification[]);
        setLoading(false);
      }
    }

    load();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!cancelled) {
            setNotifications((prev) => [payload.new as DbNotification, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, loading, unreadCount, markAllRead };
}
