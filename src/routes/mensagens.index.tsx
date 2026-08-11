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
      { name: "description", content: "Chat em tempo real e mídias." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { profileId } = useAppState();
  const { profiles, loading } = useProfiles();
  const [mutualIds, setMutualIds] = useState<Set<string>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!profileId) return;
    fetchMutualMatchIds(profileId).then(setMutualIds);
  }, [profileId]);

  // Consulta otimizada e blindada para buscar mensagens não lidas por remetente
  useEffect(() => {
    if (!profileId) return;

    async function fetchUnread() {
      // Busca todas as mensagens não lidas onde você é o receiver_id
      const { data, error } = await supabase
        .from("chat_messages")
        .select("sender_id, receiver_id, is_read")
        .eq("receiver_id", profileId)
        .eq("is_read", false);

      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach((m: any) => {
          const senderId = String(m.sender_id || "").trim();
          if (senderId) {
            counts[senderId] = (counts[senderId] || 0) + 1;
          }
        });
        setUnreadCounts(counts);
      }
    }

    fetchUnread();

    const channel = supabase
      .channel(`chat_messages_unread_fixed_${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${profileId}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  const displayProfiles = profiles.filter(p => p.id !== profileId && (p.is_demo || mutualIds.has(p.id)));

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      {/* SEÇÃO CONVERSAS */}
      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {displayProfiles.length === 0 ? (
            <li className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-surface-2">
                <MessageCircle className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Nenhum match ainda</p>
            </li>
          ) : (
            displayProfiles.map((p) => {
              const profileKey = String(p.id || "").trim();
              const unread = unreadCounts[profileKey] || 0;

              return (
                <li key={p.id}>
                  <Link to="/mensagens/$chatId" params={{ chatId: p.id }}
                    className="flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface">
                    
                    <div className="relative shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} className="size-14 rounded-full object-cover" />
                      ) : (
                        <div className="size-14 rounded-full bg-surface-2" />
                      )}
                      
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background shadow-md">
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
                          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary shrink-0">
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
            })
          )}
        </ul>
      </section>
    </div>
  );
}
