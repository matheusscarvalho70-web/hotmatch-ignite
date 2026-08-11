import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
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

  // Chave única para salvar no celular quais chats já foram abertos/lidos
  const storageKey = `read_chats_${profileId}`;

  useEffect(() => {
    if (!profileId) return;

    async function fetchCounts() {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("sender_id, receiver_id, created_at")
        .eq("receiver_id", profileId);

      if (!error && data) {
        // Recupera do armazenamento local quais chats já foram vistos
        let readCache: Record<string, string> = {};
        try {
          readCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch (e) {}

        const counts: Record<string, number> = {};
        
        data.forEach((m: any) => {
          const sender = String(m.sender_id || "").trim();
          if (sender && sender !== profileId) {
            // Se houver registro de leitura, só conta mensagens enviadas DEPOIS da última abertura
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
  }, [profileId]);

  // Função que zera o contador individual ao clicar no chat do usuário
  const handleOpenChat = (senderId: string) => {
    try {
      let readCache: Record<string, string> = {};
      try {
        readCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
      } catch (e) {}

      // Salva o horário atual como o momento em que este chat foi lido
      readCache[senderId] = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(readCache));

      // Zera o contador na tela imediatamente para este usuário
      setUnreadCounts(prev => ({ ...prev, [senderId]: 0 }));
    } catch (e) {}
  };

  const displayProfiles = profiles.filter(p => p.id !== profileId);

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {displayProfiles.map((p) => {
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
          })}
        </ul>
      </section>
    </div>
  );
}
