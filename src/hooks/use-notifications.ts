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

      if (!targetId && authUserId) {
        targetId = authUserId;
      }

      if (!targetId) {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Busca as notificações do ID atual
      let { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false })
        .limit(40);

      // SE NÃO TIVER NENHUMA NOTIFICAÇÃO, CRIA UMA DE BOAS-VINDAS AUTOMATICAMENTE PARA ESTE USUÁRIO
      if ((!data || data.length === 0) && !error) {
        const newWelcome = {
          user_id: targetId,
          type: "welcome",
          title: "Bem-vindo ao HotMatch! 🔥",
          content: "Explore o feed e converse com pessoas incríveis.",
          is_read: false,
        };

        const { data: inserted } = await supabase
          .from("notifications")
          .insert([newWelcome])
          .select();

        if (inserted) {
          data = inserted as DbNotification[];
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
    let targetId = profileId;
    if (!targetId && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      targetId = profile ? profile.id : user.id;
    }

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
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
