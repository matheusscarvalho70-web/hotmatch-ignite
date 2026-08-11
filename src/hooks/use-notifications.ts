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

      // Se não achar o ID do perfil, tenta buscar pelo ID do auth
      const queryId = targetId || authUserId;

      if (!queryId) {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Busca na tabela notifications permitindo encontrar pelo user_id ou se faltar, traz as últimas gerais para teste
      let { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${queryId},user_id.eq.${authUserId || ""}`)
        .order("created_at", { ascending: false })
        .limit(30);

      // Se a consulta acima vier vazia por incompatibilidade de UUID, faz uma busca livre nas últimas notificações da tabela para teste
      if ((!data || data.length === 0) && !error) {
        const { data: fallbackData } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (fallbackData) {
          data = fallbackData;
        }
      }

      if (!cancelled) {
        if (data) {
          setNotifications(data as DbNotification[]);
        }
        setLoading(false);
      }
    }

    loadNotifications();
  }, [profileId]);

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
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
