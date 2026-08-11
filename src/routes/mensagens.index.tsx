import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, MessageCircle, Search } from "lucide-react";
import { TopBar } from "@/components/hotmatch/TopBar";
import { useProfiles } from "@/hooks/use-profiles";
import { fetchMutualMatchIds } from "@/hooks/use-matches";
import { useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mensagens/")({
  component: Messages,
});

function Messages() {
  const { profileId } = useAppState();
  const { profiles, loading } = useProfiles();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // TESTE VISUAL NA TELA: Vamos ver se o profileId existe aqui
  useEffect(() => {
    console.log("-> VALOR DO PROFILEID NA TELA DE MENSAGENS:", profileId);
    if (!profileId) return;

    supabase
      .from("chat_messages")
      .select("sender_id")
      .eq("receiver_id", profileId)
      .eq("is_read", false)
      .then(({ data }) => {
        console.log("-> MENSAGENS RETORNADAS PARA ESTE ID:", data);
        if (data) {
          const counts: Record<string, number> = {};
          data.forEach((m: any) => {
            counts[String(m.sender_id).trim()] = (counts[String(m.sender_id).trim()] || 0) + 1;
          });
          setUnreadCounts(counts);
        }
      });
  }, [profileId]);

  const displayProfiles = profiles.filter(p => p.id !== profileId);

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      {/* CAIXA DE DEBUG VISUAL NA TELA */}
      <div className="m-4 rounded-xl bg-red-500/10 border border-red-500 p-3 text-xs text-red-500">
        <p><b>DEBUG DE ID LOGADO:</b> {profileId || "⚠️ PROFILEID ESTÁ VAZIO (NULL) AQUI!"}</p>
      </div>

      <section className="mt-5">
        <h2 className="px-4 text-xs font-bold uppercase text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {displayProfiles.map((p) => {
            const unread = unreadCounts[String(p.id).trim()] || 0;
            return (
              <li key={p.id}>
                <Link to="/mensagens/$chatId" params={{ chatId: p.id }} className="flex items-center gap-3 p-3">
                  <div className="relative">
                    {p.avatar_url ? <img src={p.avatar_url} className="size-14 rounded-full object-cover" /> : <div className="size-14 rounded-full bg-surface-2" />}
                    {unread > 0 && <span className="absolute -top-1 -right-1 size-5 flex items-center justify-center rounded-full bg-primary text-[10px] text-white">{unread}</span>}
                  </div>
                  <div>
                    <p className="font-bold">{p.name}</p>
                    {unread > 0 && <p className="text-xs text-primary font-bold">{unread} nova(s) mensagem(ns)</p>}
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
