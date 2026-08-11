import { useEffect, useState } from "react";
import { supabase, type DbNotification } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export function useNotifications() {
  const { profileId } = useAppState();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      const authUserId = user?.id;

      let targetId = profileId;
      if (!targetId && authUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", authUserId)
          .maybeSingle();
        if (profile) targetId = profile.id;
      }

      const queryId = targetId || authUserId;

      if (!queryId) {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Busca limpa direcionada apenas para o usuário logado atual
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", queryId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!cancelled) {
        if (!error && data) {
          setNotifications(data as DbNotification[]);
        } else {
          setNotifications([]);
        }
        setLoading(false);
      }
    }

    loadNotifications();
  }, [profileId]);

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    const targetId = profileId || authUserId;

    if (!targetId) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", targetId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => {
      const type = n.type?.toLowerCase();
      return !n.is_read && type !== "message" && type !== "msg" && type !== "chat";
    }).length,
    markAllRead,
  };
}
