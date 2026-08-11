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

      // 1. Tenta pegar o ID direto da store ou da sessão do Supabase Auth / Profiles
      let targetId = profileId;

      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Busca o perfil correspondente ao usuário logado
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile) {
            targetId = profile.id;
          } else {
            targetId = user.id;
          }
        }
      }

      if (!targetId) {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // 2. Busca todas as notificações do usuário (sem restrição de lidas/não lidas)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false })
        .limit(40);

      if (!cancelled) {
        if (!error && data) {
          setNotifications(data as DbNotification[]);
        }
        setLoading(false);
      }

      // 3. Ouve novas notificações em tempo real para este ID exato
      const channel = supabase
        .channel(`notifications-realtime-${targetId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${targetId}`,
          },
          (payload) => {
            if (!cancelled) {
              setNotifications((prev) => [payload.new as DbNotification, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        supabase.removeChannel(channel);
      };
    }

    const cleanupPromise = loadNotifications();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [profileId]);

  async function markAllRead() {
    let targetId = profileId;
    if (!targetId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        targetId = profile ? profile.id : user.id;
      }
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
