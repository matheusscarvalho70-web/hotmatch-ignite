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

      let targetId = profileId;

      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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

      console.log("🔍 [DIAGNÓSTICO SININHO] ID Buscado:", targetId);

      if (!targetId) {
        console.warn("⚠️ [DIAGNÓSTICO SININHO] Nenhum ID encontrado para buscar notificações.");
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Busca na tabela notifications
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false })
        .limit(40);

      if (error) {
        console.error("❌ [DIAGNÓSTICO SININHO] Erro na consulta do Supabase:", error);
      } else {
        console.log("✅ [DIAGNÓSTICO SININHO] Notificações encontradas:", data);
      }

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
    // Mantém a função limpa
  }

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
