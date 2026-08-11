import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, MessageCircle, Search } from "lucide-react";
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

  useEffect(() => {
    if (!profileId) return;

    async function fetchUnread() {
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
  }, [profileId]);

  // MOSTRA TODOS OS PERFIS EXCETO O SEU (SEM TRAVA DE MATCH PARA TESTE)
  const displayProfiles = profiles.filter(p => p.id !== profileId);

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas (Modo Diagnóstico)</h2>
        <ul className="mt-2 px-2">
          {displayProfiles.map((p) => {
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
                        {unread}
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
                    <p className="text-xs text-muted-foreground">ID: {p.id}</p>
                    {unread > 0 && <p className="text-xs text-primary font-bold">Tem mensagem não lida!</p>}
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
