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
  MoreVertical,
  Play,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { gifts } from "@/lib/hotmatch/data";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { useChat, type LocalMessage } from "@/hooks/use-chat";
import { useProfiles } from "@/hooks/use-profiles";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mensagens/$chatId")({
  head: () => ({
    meta: [
      { title: "Conversa — HotMatch" },
      { name: "description", content: "Chat privado HotMatch com áudio, mídias exclusivas pagas e mimos virtuais." },
      { property: "og:title", content: "Conversa — HotMatch" },
      { property: "og:description", content: "Mensagens, áudios, mídias privadas e presentes." },
    ],
  }),
  component: Chat,
});

const AUTO_REPLIES = [
  "Que delícia de mensagem 😘",
  "Você me deixa tão animada!",
  "rs adorei 😍",
  "Sério mesmo? Conta mais 👀",
];

function Chat() {
  const { chatId } = useParams({ from: "/mensagens/$chatId" });
  const { unlocked, profileId, gender } = useAppState();
  const isCreator = gender === "female";
  const myId = profileId ?? "";

  const partnerId = chatId;
  const { profiles: dbProfiles } = useProfiles();
  const dbPartner = dbProfiles.find((p) => p.id === partnerId);

  const partnerName   = dbPartner?.name      ?? "Conversa";
  const partnerAvatar = dbPartner?.avatar_url ?? null;

  const { messages, loading, sendText, sendAudio, sendGift, sendLockedMedia } = useChat(partnerId);

  const [text, setText] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [privMediaOpen, setPrivMediaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!text.trim()) return;
    const body = text;
    setText("");
    const { error } = await sendText(body);
    if (error) { toast.error("Erro ao enviar mensagem."); return; }
    if (myId && partnerId) {
      setTimeout(async () => {
        await supabase.from("chat_messages").insert({
          sender_id: partnerId,
          receiver_id: myId,
          content: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          message_kind: "text",
        });
      }, 900);
    }
  }

  function startRecording() {
    setRecording(true);
    setRecordSecs(0);
    recordTimer.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  }

  async function stopRecording() {
    if (recordTimer.current) clearInterval(recordTimer.current);
    const secs = recordSecs + 1;
    setRecording(false);
    setRecordSecs(0);
    if (secs >= 1) {
      await sendAudio(secs);
      setTimeout(async () => {
        await supabase.from("chat_messages").insert({
          sender_id: partnerId,
          receiver_id: myId,
          message_kind: "audio",
          audio_seconds: Math.floor(4 + Math.random() * 12),
        });
      }, 1200);
    }
  }

  async function submitReport() {
    if (!reportSubject.trim()) { toast.error("Informe o assunto da denúncia."); return; }
    await supabase.from("reports").insert({
      reporter_id: myId || null, reported_user_id: partnerId || null,
      subject: reportSubject, description: reportDesc,
    });
    setReportOpen(false); setReportSubject(""); setReportDesc("");
    toast("Denúncia enviada com sucesso.", { description: "Nossa equipe analisará o caso. 🛡️" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 flex items-center gap-3 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Link to="/mensagens" className="tap-scale grid size-9 place-items-center rounded-full">
          <ArrowLeft className="size-5" />
        </Link>
        {partnerAvatar ? (
          <img src={partnerAvatar} alt={partnerName} width={128} height={128} className="size-10 rounded-full object-cover" />
        ) : (
          <div className="size-10 rounded-full bg-surface-2" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{partnerName}</p>
          <p className="text-[11px] text-primary">online agora</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="tap-scale grid size-9 place-items-center rounded-full bg-surface-2">
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[45]" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-[46] min-w-[160px] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
                <button
                  onClick={() => { setMenuOpen(false); setReportOpen(true); }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-400 hover:bg-surface-2"
                >
                  🚩 Denunciar perfil
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 px-4 py-4">
        {loading && <div className="flex justify-center py-8"><span className="text-sm text-muted-foreground">Carregando conversa…</span></div>}
        {messages.map((m) => (
          <Bubble key={m.id} m={m} unlocked={unlocked.includes(m.id)}
            onUnlock={() => {
              if (actions.unlock(m.id, m.price ?? 0)) toast("Mídia privada liberada 🔓");
              else toast.error("Saldo insuficiente", { description: "Recarregue na Loja VIP." });
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Recording indicator */}
      {recording && (
        <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
          <span className="relative grid size-3 place-items-center">
            <span className="absolute size-3 animate-ping rounded-full bg-primary/60" />
            <span className="size-2 rounded-full bg-primary" />
          </span>
          <span className="flex-1 text-sm font-semibold text-primary">Gravando áudio... 0:{String(recordSecs).padStart(2, "0")}</span>
          <span className="flex items-center gap-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="w-0.5 rounded-full bg-primary" style={{ height: `${6 + ((recordSecs * 3 + i * 7) % 16)}px`, transition: "height 0.15s ease" }} />
            ))}
          </span>
        </div>
      )}

      {/* Input bar — gender-aware */}
      <div className="glass-panel sticky bottom-0 flex items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
        {isCreator ? (
          <button
            onClick={() => setPrivMediaOpen(true)}
            className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-hot shadow-hot"
            aria-label="Enviar mídia privada paga"
          >
            <Lock className="size-5 text-primary-foreground" />
          </button>
        ) : (
          <button
            onClick={() => setGiftOpen(true)}
            className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-gold shadow-gold"
            aria-label="Enviar mimo"
          >
            <Gift className="size-5 text-gold-foreground" />
          </button>
        )}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Mensagem..."
          className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        {text.trim() ? (
          <button onClick={handleSend} className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-hot shadow-hot">
            <Send className="size-5 text-primary-foreground" />
          </button>
        ) : recording ? (
          <button onPointerUp={stopRecording} className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-primary shadow-hot">
            <MicOff className="size-5 text-primary-foreground" />
          </button>
        ) : (
          <button onPointerDown={startRecording} onPointerUp={stopRecording} className="tap-scale grid size-10 shrink-0 place-items-center rounded-full bg-gradient-hot shadow-hot">
            <Mic className="size-5 text-primary-foreground" />
          </button>
        )}
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm" onClick={() => setReportOpen(false)}>
          <div className="w-full max-w-[22rem] overflow-hidden rounded-3xl border border-border bg-surface" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-extrabold">Denunciar perfil</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Nossa equipe analisa em até 24h.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Assunto</label>
                <input type="text" value={reportSubject} onChange={(e) => setReportSubject(e.target.value)}
                  placeholder="Ex: Conteúdo impróprio, spam..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Descrição do problema</label>
                <textarea value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={4}
                  placeholder="Descreva o que aconteceu..."
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setReportOpen(false)} className="flex-1 rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground">Cancelar</button>
                <button onClick={submitReport} className="tap-scale flex-1 rounded-full bg-gradient-hot py-3 text-sm font-extrabold text-primary-foreground shadow-hot">Enviar Denúncia</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift panel — male users only */}
      {!isCreator && giftOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setGiftOpen(false)}>
          <div className="glass-panel w-full max-w-[30rem] rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="text-lg font-extrabold">
              Enviar mimo para{" "}
              <span className="text-gradient-gold">{partnerName}</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Presentes aumentam suas chances de resposta em até 4×.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {gifts.map((g) => (
                <button
                  key={g.id}
                  onClick={async () => {
                    if (actions.spendCoins(g.price)) {
                      await sendGift(g.emoji, g.name, g.price);
                      setGiftOpen(false);
                      toast(`${g.emoji} ${g.name} enviado!`, { description: `-${g.price} moedas` });
                      if (myId && partnerId) {
                        setTimeout(async () => {
                          await supabase.from("chat_messages").insert({
                            sender_id: partnerId, receiver_id: myId,
                            content: `Amooooo! Obrigada pelo ${g.name} ${g.emoji} 😍`,
                            message_kind: "text",
                          });
                        }, 1000);
                      }
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

      {/* Private media modal — creators only */}
      {isCreator && privMediaOpen && (
        <PrivateMediaModal
          onClose={() => setPrivMediaOpen(false)}
          onSend={async (url, price) => {
            await sendLockedMedia(url, price);
            setPrivMediaOpen(false);
            toast("Mídia privada enviada 🔒", { description: `Preço: ${price} moedas` });
          }}
        />
      )}
    </div>
  );
}

function PrivateMediaModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (url: string, price: number) => void;
}) {
  const [price, setPrice] = useState(60);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    if (!file) { toast.error("Selecione uma foto ou vídeo."); return; }
    setUploading(true);
    const path = `private/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("photos").upload(path, file, { upsert: true, contentType: file.type });
    if (error || !data) {
      toast.error("Erro ao fazer upload da mídia.");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(data.path);
    onSend(publicUrl, price);
    setUploading(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full max-w-[30rem] rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <h2 className="text-lg font-extrabold">Enviar mídia privada 🔒</h2>
        <p className="mt-1 text-sm text-muted-foreground">Defina um preço em moedas para desbloquear.</p>
        <button onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-6">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 rounded-xl object-contain" />
          ) : (
            <>
              <ImagePlus className="size-6 text-primary" />
              <span className="text-sm font-semibold text-primary">Selecionar foto ou vídeo</span>
            </>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
          }}
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Preço de desbloqueio</span>
          <span className="text-sm font-bold text-gold">{price} moedas</span>
        </div>
        <input type="range" min={10} max={300} step={10} value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-2 w-full accent-[oklch(0.86_0.16_92)]" />
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold">Cancelar</button>
          <button onClick={handleSend} disabled={uploading || !file}
            className="tap-scale flex-[1.4] rounded-full bg-gradient-hot py-3 text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-50">
            {uploading ? "Enviando..." : "Enviar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  m,
  unlocked,
  onUnlock,
}: {
  m: LocalMessage;
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
              <span key={i} className={`w-[2.5px] rounded-full bg-current transition-opacity ${playing ? "opacity-100" : "opacity-60"}`}
                style={{ height: `${6 + ((i * 7) % 18)}px` }} />
            ))}
          </span>
          <span className="text-[11px] tabular-nums opacity-80">0:{String(m.seconds ?? 0).padStart(2, "0")}</span>
        </div>
        <p className="mt-0.5 text-right text-[10px] opacity-60">{m.time}</p>
      </div>
    );

  if (m.kind === "locked")
    return (
      <div className="max-w-[78%] overflow-hidden rounded-3xl rounded-bl-lg border border-gold/30 bg-surface-2">
        <div className="relative aspect-square w-full">
          {m.media ? (
            <img src={m.media} alt="Mídia privada" width={768} height={1024} loading="lazy"
              className={`size-full object-cover ${unlocked ? "" : "scale-110 blur-2xl brightness-50"}`} />
          ) : (
            <div className={`size-full bg-surface-2 ${unlocked ? "" : "blur-2xl brightness-50"}`} />
          )}
          {!unlocked && (
            <div className="absolute inset-0 grid place-items-center">
              <Lock className="size-8 text-gold" />
            </div>
          )}
        </div>
        <div className="space-y-2 p-3">
          <p className="text-sm">{m.text}</p>
          {!unlocked && (
            <button onClick={onUnlock}
              className="tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-2.5 text-xs font-bold text-gold-foreground">
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
