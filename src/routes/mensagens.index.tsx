import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, MessageCircle, Search } from "lucide-react";
import { TopBar } from "@/components/hotmatch/TopBar";
import { useProfiles } from "@/hooks/use-profiles";
import { fetchMutualMatchIds } from "@/hooks/use-matches";
import { useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mensagens/")({
  head: () => ({
    meta: [
      { title: "Mensagens & Mimos — HotMatch" },
      { name: "description", content: "Chat em tempo real e notificações." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { profileId } = useAppState();
  const { profiles, loading } = useProfiles();

  const [mutualIds, setMutualIds] = useState<Set<string>>(new Set());
  const [matchLoading, setMatchLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!profileId) { setMatchLoading(false); return; }
    let cancelled = false;
    fetchMutualMatchIds(profileId).then((ids) => {
      if (!cancelled) { setMutualIds(ids); setMatchLoading(false); }
    });
    return () => { cancelled = true; };
  }, [profileId]);

  // Sincronização unificada com a tabela notifications
  useEffect(() => {
    if (!profileId) return;

    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("sender_id, type, is_read")
          .eq("user_id", profileId) // Ajuste se a coluna for receiver_id ou similar
          .eq("type", "message")
          .eq("is_read", false);

        if (!error && data) {
          const counts: Record<string, number> = {};
          data.forEach((n: any) => {
            const senderKey = String(n.sender_id || "").trim();
            if (senderKey) {
              counts[senderKey] = (counts[senderKey] || 0) + 1;
            }
          });
          setUnreadCounts(counts);
        }
      } catch (err) {
        console.warn("Erro ao buscar notificações:", err);
      }
    }

    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications:sync:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profileId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  const isLoading = loading || matchLoading;
  const displayProfiles = profiles.filter((p) => {
    if (p.id === profileId) return false;
    if (p.is_demo) return true;
    return mutualIds.has(p.id);
  });

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      <section className="mt-5">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Matches recentes</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {isLoading ? <div className="h-20 animate-pulse bg-surface-2 w-full rounded-2xl" /> : displayProfiles.map((p) => {
            const unread = unreadCounts[String(p.id).trim()] || 0;
            return (
              <Link key={p.id} to="/mensagens/$chatId" params={{ chatId: p.id }} className="relative flex w-16 shrink-0 flex-col items-center gap-1.5">
                <span className="ring-match relative grid size-16 place-items-center rounded-full p-[2.5px]">
                  {p.avatar_url ? <img src={p.avatar_url} className="size-full rounded-full object-cover" /> : <div className="size-full rounded-full bg-surface-2" />}
                  {unread > 0 && <span className="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background shadow-md">{unread}</span>}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">{p.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {displayProfiles.map((p) => {
            const unread = unreadCounts[String(p.id).trim()] || 0;
            return (
              <li key={p.id}>
                <Link to="/mensagens/$chatId" params={{ chatId: p.id }} className="flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface">
                  <div className="relative">
                    {p.avatar_url ? <img src={p.avatar_url} className="size-14 rounded-full object-cover" /> : <div className="size-14 rounded-full bg-surface-2" />}
                    {unread > 0 && <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background shadow-md">{unread}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{p.name}</p>
                    {unread > 0 && <p className="text-xs font-semibold text-primary">{unread} nova(s) mensagem(ns)</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
