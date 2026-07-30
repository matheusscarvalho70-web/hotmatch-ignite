import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Search } from "lucide-react";
import { TopBar } from "@/components/hotmatch/TopBar";
import { chats, profiles } from "@/lib/hotmatch/data";

export const Route = createFileRoute("/mensagens/")({
  head: () => ({
    meta: [
      { title: "Mensagens & Mimos — HotMatch" },
      {
        name: "description",
        content:
          "Converse com seus matches, envie áudios, mídias privadas e mimos virtuais no HotMatch.",
      },
      { property: "og:title", content: "Mensagens & Mimos — HotMatch" },
      {
        property: "og:description",
        content: "Chat em tempo real, mídias privadas pagas e presentes virtuais.",
      },
    ],
  }),
  component: Messages,
});

function Messages() {
  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Mensagens" />

      <section className="px-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Buscar conversa"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Matches recentes
        </h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {[...profiles, ...profiles].map((p, i) => (
            <Link
              key={p.id + i}
              to="/mensagens/$chatId"
              params={{ chatId: p.id }}
              className="tap-scale flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className="ring-match grid size-16 place-items-center rounded-full p-[2.5px]">
                <img
                  src={p.photo}
                  alt={p.name}
                  width={768}
                  height={1024}
                  loading="lazy"
                  className="size-full rounded-full object-cover"
                />
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Conversas
        </h2>
        <ul className="mt-2 px-2">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                to="/mensagens/$chatId"
                params={{ chatId: c.id }}
                className="tap-scale flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface"
              >
                <img
                  src={c.profile.photo}
                  alt={c.profile.name}
                  width={768}
                  height={1024}
                  loading="lazy"
                  className="size-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-bold">{c.profile.name}</p>
                    {c.profile.creator && (
                      <Crown className="size-3.5 shrink-0 text-gold" fill="currentColor" />
                    )}
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                      {c.time}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={`truncate text-sm ${c.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {c.last}
                    </p>
                    {c.unread > 0 && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gradient-hot text-[10px] font-bold text-primary-foreground">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
