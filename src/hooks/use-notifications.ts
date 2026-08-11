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

      // Pega o ID da store e também o ID do Auth do Supabase simultaneamente
      const { data: { user } } = await supabase.auth.getUser();
      const authUserId = user?.id;

      let profileRowId = profileId;
      if (!profileRowId && authUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", authUserId)
          .maybeSingle();
        if (profile) profileRowId = profile.id;
      }

      // Junta todos os IDs possíveis para garantir que encontre a notificação onde quer que ela esteja salva
      const possibleIds = [profileId, profileRowId, authUserId].filter(Boolean) as string[];
      const uniqueIds = Array.from(new Set(possibleIds));

      if (uniqueIds.length === 0) {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Busca na tabela notifications usando QUALQUER um dos IDs válidos
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .in("user_id", uniqueIds)
        .order("created_at", { ascending: false })
        .limit(40);

      if (!cancelled) {
        if (!error && data) {
          setNotifications(data as DbNotification[]);
        }
        setLoading(false);
      }
    }

    loadNotifications();
  }, [profileId]);

  async function markAllRead() {
    // Mantém limpo
  }

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
