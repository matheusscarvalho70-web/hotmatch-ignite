import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [allMessages, setAllMessages] = useState<any[]>([]);

  useEffect(() => {
    async function checkAll() {
      // Pega TODAS as mensagens da tabela sem filtro nenhum
      const { data } = await supabase
        .from("chat_messages")
        .select("*");
      
      if (data) {
        setAllMessages(data);
      }
    }
    checkAll();
  }, []);

  const displayProfiles = profiles.filter(p => p.id !== profileId);

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      {/* CAIXA DE AUDITORIA NA TELA */}
      <div className="m-4 p-4 rounded-xl bg-surface-2 text-xs text-foreground space-y-2">
        <p className="font-bold text-primary">AUDITORIA DE MENSAGENS NO BANCO:</p>
        <p>Total de mensagens na tabela: {allMessages.length}</p>
        {allMessages.map((m, idx) => (
          <div key={idx} className="border-t border-border pt-1">
            <p>De: {m.sender_id?.slice(0, 6)}... | Para: {m.receiver_id?.slice(0, 6)}...</p>
            <p>Texto: "{m.content}" | is_read: <span className="font-bold text-primary">{String(m.is_read)}</span></p>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversas</h2>
        <ul className="mt-2 px-2">
          {displayProfiles.map((p) => (
            <li key={p.id}>
              <Link to="/mensagens/$chatId" params={{ chatId: p.id }}
                className="flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface">
                {p.avatar_url ? <img src={p.avatar_url} className="size-14 rounded-full object-cover" /> : <div className="size-14 rounded-full bg-surface-2" />}
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Toque para abrir chat</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
