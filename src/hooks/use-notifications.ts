import { useEffect, useState } from "react";
import { supabase, type DbNotification } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export function useNotifications() {
  const { profileId } = useAppState();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchUserAndNotifications() {
      // Garante o ID ativo do usuário por store ou direto da sessão do Supabase
      let currentUserId = profileId;
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id || null;
      }

      if (!currentUserId) {
        if (!cancelled) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // BUSCA TODAS (Lidas e Não Lidas) ordenadas da mais recente para a mais antiga
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(40);

      if (!cancelled) {
        if (!error && data) {
          setNotifications(data as DbNotification[]);
        }
        setLoading(false);
      }

      // Tempo real para novas notificações chegarem na hora para o ID correto
      const channel = supabase
        .channel(`notif:${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload) => {
            if (!cancelled) {
              setNotifications((p) => [payload.new as DbNotification, ...p]);
            }
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        supabase.removeChannel(channel);
      };
    }

    const cleanupPromise = fetchUserAndNotifications();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [profileId]);

  async function markAllRead() {
    let currentUserId = profileId;
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      currentUserId = user?.id || null;
    }

    if (!currentUserId) return;

    // Marca no banco como lida apenas para tirar a bolinha vermelha do sininho
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUserId)
      .eq("is_read", false);
    
    // Atualiza o estado local mantendo elas na tela (agora como lidas)
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  }

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    markAllRead,
  };
}
