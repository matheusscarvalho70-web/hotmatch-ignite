import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { TopBar } from "@/components/hotmatch/TopBar";
import { useProfiles } from "@/hooks/use-profiles";
import { useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mensagens/")({
  component: Messages,
});

function Messages() {
  const { profileId } = useAppState();
  const { profiles } = useProfiles();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedUserIds, setMatchedUserIds] = useState<string[]>([]);

  const storageKey = `read_chats_${profileId}`;

  // Buscar os matches reais do usuário no Supabase
  useEffect(() => {
    if (!profileId) return;

    async function fetchMatches() {
      // Verificando na tabela mutual_matches (ajuste para 'matches' se sua regra for outra)
      const { data, error } = await supabase
        .from("mutual_matches")
        .select("user_1, user_2")
        .or(`user_1.eq.${profileId},user_2.eq.${profileId}`);

      if (!error && data) {
        const ids: string[] = [];
        data.forEach((match: any) => {
          if (match.user_1 === profileId) {
            ids.push(match.user_2);
          } else if (match.user_2 === profileId) {
            ids.push(match.user_1);
          }
        });
        setMatchedUserIds(ids);
      }
    }

    fetchMatches();
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;

    async function fetchCounts() {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("sender_id, receiver_id, created_at")
        .eq("receiver_id", profileId);

      if (!error && data) {
        let readCache: Record<string, string> = {};
        try {
          readCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch (e) {}

        const counts: Record<string, number> = {};
        
        data.forEach((m: any) => {
          const sender = String(m.sender_id || "").trim();
          if (sender && sender !== profileId) {
            const lastReadTime = readCache[sender];
            if (!lastReadTime || new Date(m.created_at) > new Date(lastReadTime)) {
              counts[sender] = (counts[sender] || 0) + 1;
            }
          }
        });
        setUnreadCounts(counts);
      }
    }

    fetchCounts();
  }, [profileId, storageKey]);

  const handleOpenChat = (senderId: string) => {
    try {
      let readCache: Record<string, string> = {};
      try {
        readCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
      } catch (e) {}

      readCache[senderId] = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(readCache));

      setUnreadCounts(prev => ({ ...prev, [senderId]: 0 }));
    } catch (e) {}
  };

  // Filtra apenas os perfis cujo ID está presente na lista de matches reais
  const displayProfiles = profiles.filter(p => matchedUserIds.includes(p.id));

  // Filtro para a barra de busca
  const filteredProfiles = displayProfiles.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      {/* BARRA DE BUSCA DE CONVERSA */}
      <div className="px-4 mt-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar conversa"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-full bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* MATCHES RECENTES (CARROSSEL HORIZONTAL) */}
      {!searchQuery && (
        <section className="mt-6">
          <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Matches Recentes</h2>
          <div className="flex gap-4 overflow-x-auto px-4 mt-3 pb-2 scrollbar-none">
            {displayProfiles.length === 0 ? (
              <p className="px-4 text-sm text-muted-foreground">Nenhum match recente ainda.</p>
            ) : (
              displayProfiles.map((p) => {
                const profileKey = String(p.id || "").trim();
                const unread = unreadCounts[profileKey] || 0;

                return (
                  <Link
                    key={`match-${p.id}`}
                    to="/mensagens/$chatId"
                    params={{ chatId: p.id }}
                    onClick={() => handleOpenChat(profileKey)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} className="size-16 rounded-full object-cover border-2 border-background" />
                      ) : (
                        <div className="size-16 rounded-full bg-surface-2 border-2 border-background" />
                      )}
                      {unread > 0 && (
                        <span className="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background shadow-md">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate w-16 text-center">{p.name}</span>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* LISTA DE CONVERSAS */}
      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {filteredProfiles.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">Nenhuma conversa iniciada.</li>
          ) : (
            filteredProfiles.map((p) => {
              const profileKey = String(p.id || "").trim();
              const unread = unreadCounts[profileKey] || 0;

              return (
                <li key={p.id}>
                  <Link 
                    to="/mensagens/$chatId" 
                    params={{ chatId: p.id }}
                    onClick={() => handleOpenChat(profileKey)}
                    className="flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface"
                  >
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
                        <p className="truncate text-sm font-bold">{p.name}</p>
                        {unread > 0 && (
                          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary shrink-0">
                            {unread} nova{unread > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 truncate text-sm ${unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {unread > 0 ? `${unread} nova(s) mensagem(ns)` : `Conversar com ${p.name}`}
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
