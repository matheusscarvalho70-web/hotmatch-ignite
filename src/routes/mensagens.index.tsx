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
      { name: "description", content: "Chat em tempo real, mídias privadas pagas e presentes virtuais." },
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

  // Buscar contagens de mensagens não lidas do Supabase
  useEffect(() => {
    if (!profileId) return;

    async function fetchUnread() {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("sender_id")
          .eq("receiver_id", profileId)
          .eq("is_read", false);

        // CORREÇÃO: Verifica se NÃO há erro e se existem dados
        if (!error && data) {
          const counts: Record<string, number> = {};
          data.forEach((msg: { sender_id: string }) => {
            if (msg.sender_id) {
              counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
            }
          });
          setUnreadCounts(counts);
        }
      } catch (err) {
        console.warn("Erro ao buscar não lidas:", err);
      }
    }

    fetchUnread();

    const channel = supabase
      .channel(`public:chat_messages:unread:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${profileId}`,
        },
        (payload) => {
          const newMsg = payload.new as { sender_id: string; is_read?: boolean };
          if (newMsg && newMsg.sender_id && !newMsg.is_read) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1,
            }));
          }
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

      <section className="px-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="Buscar conversa" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Matches recentes</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
                  <div className="size-16 rounded-full bg-surface-2 animate-pulse" />
                  <div className="h-2 w-10 rounded-full bg-surface-2 animate-pulse" />
                </div>
              ))
            : displayProfiles.map((p) => {
                const unread = unreadCounts[p.id] || 0;
                return (
                  <Link key={p.id} to="/mensagens/$chatId" params={{ chatId: p.id }}
                    className="tap-scale relative flex w-16 shrink-0 flex-col items-center gap-1.5">
                    <span className="ring-match relative grid size-16 place-items-center rounded-full p-[2.5px]">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} width={200} height={200} loading="lazy" className="size-full rounded-full object-cover" />
                      ) : <div className="size-full rounded-full bg-surface-2" />}
                      {unread > 0 && (
                        <span className="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </span>
                    <span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">{p.name}</span>
                  </Link>
                );
              })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 rounded-2xl px-2 py-3">
                  <div className="size-14 shrink-0 rounded-full bg-surface-2 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded-full bg-surface-2 animate-pulse" />
                    <div className="h-2 w-40 rounded-full bg-surface-2 animate-pulse" />
                  </div>
                </li>
              ))
            : displayProfiles.length === 0 ? (
                <li className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-surface-2">
                    <MessageCircle className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">Nenhum match ainda</p>
                  <p className="max-w-xs text-xs text-muted-foreground">Dê match mútuo no feed para começar a conversar!</p>
                </li>
              ) : displayProfiles.map((p) => {
                const unread = unreadCounts[p.id] || 0;
                return (
                  <li key={p.id}>
                    <Link to="/mensagens/$chatId" params={{ chatId: p.id }}
                      className="tap-scale flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface">
                      <div className="relative shrink-0">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.name} width={200} height={200} loading="lazy" className="size-14 rounded-full object-cover" />
                        ) : <div className="size-14 rounded-full bg-surface-2" />}
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <p className="truncate text-sm font-bold">{p.name}</p>
                            {p.is_verified && <Crown className="size-3.5 shrink-0 text-gold" fill="currentColor" />}
                          </div>
                          {unread > 0 && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary shrink-0">
                              {unread} nova{unread > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className={`mt-0.5 truncate text-sm ${unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {unread > 0 ? "Nova mensagem recebida..." : `Conversar com ${p.name}`}
                        </p>
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
