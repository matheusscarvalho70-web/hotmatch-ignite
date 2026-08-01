import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Coins,
  Gift,
  ImagePlus,
  Lock,
  Mic,
  MicOff,
  Phone,
  Play,
  Send,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { gifts, initialMessages, profiles, type Message } from "@/lib/hotmatch/data";
import { actions, useAppState } from "@/lib/hotmatch/store";

export const Route = createFileRoute("/mensagens/$chatId")({
  head: () => ({
    meta: [
      { title: "Conversa — HotMatch" },
      {
        name: "description",
        content: "Chat privado HotMatch com áudio, mídias exclusivas pagas e mimos virtuais.",
      },
      { property: "og:title", content: "Conversa — HotMatch" },
      { property: "og:description", content: "Mensagens, áudios, mídias privadas e presentes." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { chatId } = useParams({ from: "/mensagens/$chatId" });
  const profile = profiles.find((p) => p.id === chatId.replace("b", "")) ?? profiles[0];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { unlocked } = useAppState();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const now = () =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  function send() {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: "me", kind: "text", text, time: now() },
    ]);
    setText("");
    setTimeout(() => {
      const replies = [
        "Que delícia de mensagem 😘",
        "Você me deixa tão animada!",
        "rs adorei 😍",
        "Sério mesmo? Conta mais 👀",
      ];
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          from: "them",
          kind: "text",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: now(),
        },
      ]);
    }, 900);
  }

  function startRecording() {
    setRecording(true);
    setRecordSecs(0);
    recordTimer.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  }

  function stopRecording() {
    if (recordTimer.current) clearInterval(recordTimer.current);
    const secs = recordSecs + 1;
    setRecording(false);
    setRecordSecs(0);
    if (secs >= 1) {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "me", kind: "audio", seconds: secs, time: now() },
      ]);
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            from: "them",
            kind: "audio",
            seconds: Math.floor(4 + Math.random() * 12),
            time: now(),
          },
        ]);
      }, 1200);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="glass-panel sticky top-0 z-40 flex items-center gap-3 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Link to="/mensagens" className="tap-scale grid size-9 place-items-center rounded-full">
          <ArrowLeft className="size-5" />
        </Link>
        <img
          src={profile.photo}
          alt={profile.name}
          width={768}
          height={1024}
          className="size-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{profile.name}</p>
          <p className="text-[11px] text-primary">online agora</p>
        </div>
        <button
          onClick={() => toast("Chamada de áudio iniciada")}
          className="tap-scale grid size-9 place-items-center rounded-full bg-surface-2"
        >
          <Phone className="size-4" />
        </button>
        <button
          onClick={() => toast("Chamada de vídeo iniciada")}
          className="tap-scale grid size-9 place-items-center rounded-full bg-surface-2"
        >
          <Video className="size-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 px-4 py-4">
        {messages.map((m) => (
          <Bubble
            key={m.id}
            m={m}
            unlocked={unlocked.includes(m.id)}
            onUnlock={() => {
              if (actions.unlock(m.id, m.price ?? 0)) toast("Mídia privada liberada 🔓");
              else toast.error("Saldo insuficiente", { description: "Recarregue na Loja VIP." });
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {recording && (
        <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
          <span className="relative grid size-3 place-items-center">
            <span className="absolute size-3 animate-ping rounded-full bg-primary/60" />
            <span className="size-2 rounded-full bg-primary" />
          </span>
          <span className="flex-1 text-sm font-semibold text-primary">
            Gravando áudio... 0:{String(recordSecs).padStart(2, "0")}
          </span>
          <span className="flex items-center gap-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="w-0.5 rounded-full bg-primary"
                style={{
                  height: `${6 + ((recordSecs * 3 + i * 7) % 16)}px`,
                  transition: "height 0.15s ease",
                }}
              />
            ))}
          </span>
        </div>
      )}

      <div className="glass-panel sticky bottom-0 flex items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
        <button
          onClick={() => toast("Enviar mídia privada paga", { description: "Defina o valor em moedas." })}
          className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-surface-2"
        >
          <ImagePlus className="size-5" />
        </button>
        <button
          onClick={() => setGiftOpen(true)}
          className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-gold shadow-gold"
          aria-label="Enviar mimo"
        >
          <Gift className="size-5 text-gold-foreground" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Mensagem..."
          className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        {text.trim() ? (
          <button
            onClick={send}
            className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-hot shadow-hot"
          >
            <Send className="size-5 text-primary-foreground" />
          </button>
        ) : recording ? (
          <button
            onPointerUp={stopRecording}
            className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-primary shadow-hot"
          >
            <MicOff className="size-5 text-primary-foreground" />
          </button>
        ) : (
          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-hot shadow-hot"
          >
            <Mic className="size-5 text-primary-foreground" />
          </button>
        )}
      </div>

      {giftOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setGiftOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-[30rem] rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="text-lg font-extrabold">
              Enviar mimo para{" "}
              <span className="text-gradient-gold">{profile.name}</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Presentes aumentam suas chances de resposta em até 4×.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {gifts.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (actions.spendCoins(g.price)) {
                      setMessages((m) => [
                        ...m,
                        {
                          id: crypto.randomUUID(),
                          from: "me",
                          kind: "gift",
                          text: `${g.emoji} ${g.name}`,
                          price: g.price,
                          time: now(),
                        },
                      ]);
                      setGiftOpen(false);
                      toast(`${g.emoji} ${g.name} enviado!`, { description: `-${g.price} moedas` });
                      setTimeout(() => {
                        setMessages((m) => [
                          ...m,
                          {
                            id: crypto.randomUUID(),
                            from: "them",
                            kind: "text",
                            text: `Amooooo! Obrigada pelo ${g.name} ${g.emoji} 😍`,
                            time: now(),
                          },
                        ]);
                      }, 1000);
                    } else {
                      toast.error("Saldo insuficiente");
                    }
                  }}
                  className="tap-scale flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface-2 py-3"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-[11px] font-semibold">{g.name}</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gold">
                    <Coins className="size-3" />
                    {g.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({
  m,
  unlocked,
  onUnlock,
}: {
  m: Message;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  const [playing, setPlaying] = useState(false);

  const mine = m.from === "me";
  const base = `max-w-[78%] rounded-3xl px-4 py-2.5 text-sm ${
    mine
      ? "ml-auto bg-gradient-hot text-primary-foreground rounded-br-lg"
      : "bg-surface-2 text-foreground rounded-bl-lg"
  }`;

  if (m.kind === "gift")
    return (
      <div className="mx-auto flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-bold text-gold">
        {m.text} · {m.price} moedas
      </div>
    );

  if (m.kind === "audio")
    return (
      <div className={base}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPlaying(true);
              setTimeout(() => setPlaying(false), (m.seconds ?? 8) * 1000);
            }}
            className="tap-scale grid size-7 place-items-center rounded-full bg-current/20"
          >
            <Play className="size-3.5" fill="currentColor" />
          </button>
          <span className="flex h-6 flex-1 items-end gap-[3px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className={`w-[2.5px] rounded-full bg-current transition-opacity ${playing ? "opacity-100" : "opacity-60"}`}
                style={{
                  height: `${6 + ((i * 7) % 18)}px`,
                  animationDuration: playing ? `${0.3 + (i % 5) * 0.1}s` : "0s",
                }}
              />
            ))}
          </span>
          <span className="text-[11px] tabular-nums opacity-80">
            0:{String(m.seconds).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-0.5 text-right text-[10px] opacity-60">{m.time}</p>
      </div>
    );

  if (m.kind === "locked")
    return (
      <div className="max-w-[78%] overflow-hidden rounded-3xl rounded-bl-lg border border-gold/30 bg-surface-2">
        <div className="relative aspect-square w-full">
          <img
            src={m.media}
            alt="Mídia privada"
            width={768}
            height={1024}
            loading="lazy"
            className={`size-full object-cover ${unlocked ? "" : "scale-110 blur-2xl brightness-50"}`}
          />
          {!unlocked && (
            <div className="absolute inset-0 grid place-items-center">
              <Lock className="size-8 text-gold" />
            </div>
          )}
        </div>
        <div className="space-y-2 p-3">
          <p className="text-sm">{m.text}</p>
          {!unlocked && (
            <button
              onClick={onUnlock}
              className="tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-2.5 text-xs font-bold text-gold-foreground"
            >
              <Coins className="size-4" />
              Desbloquear por {m.price} moedas
            </button>
          )}
          <p className="text-right text-[10px] text-muted-foreground">{m.time}</p>
        </div>
      </div>
    );

  return (
    <div className={base}>
      <p>{m.text}</p>
      <p className="mt-0.5 text-right text-[10px] opacity-70">{m.time}</p>
    </div>
  );
}
