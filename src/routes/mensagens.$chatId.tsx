import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Coins,
  Gift,
  Heart,
  ImagePlus,
  Lock,
  Mic,
  MicOff,
  MoreVertical,
  Phone,
  Play,
  Send,
  Video,
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
    ],
  }),
  component: Chat,
});

const AUTO_REPLIES = [
  "Que delícia de mensagem 😜",
  "Você me deixa tão animada!",
  "rs adorei 😍",
  "Sério mesmo? Conta mais kk",
];

function Chat() {
  const { chatId } = useParams({ from: "/mensagens/$chatId" });
  const { unlocked, profileId, gender } = useAppState();
  const isCreator = gender === "female";
  const myId = profileId ?? "";
  const partnerId = chatId;

  const { profiles: dbProfiles } = useProfiles();
  const dbPartner = dbProfiles.find((p) => p.id === partnerId);
  const partnerName = dbPartner?.name ?? "Conversa";
  const partnerAvatar = dbPartner?.avatar_url ?? null;

  // Block chat until a confirmed mutual_matches row exists for this pair.
  const [hasMutualMatch, setHasMutualMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (!myId || !partnerId) return;
    if (dbPartner === undefined) return; // wait for profiles to load
    if (dbPartner?.is_demo) { setHasMutualMatch(true); return; }

    let cancelled = false;
    const [u1, u2] = [myId, partnerId].sort();

    // 1. Busca na tabela mutual_matches usando as colunas corretas (user_1 e user_2)
    supabase
      .from("mutual_matches")
      .select("id")
      .eq("user_1", u1)
      .eq("user_2", u2)
      .maybeSingle()
      .then(async ({ data }) => {
        if (cancelled) return;

        if (data) {
          setHasMutualMatch(true);
        } else {
          // 2. Busca de redundância direto na tabela matches (para garantir que nada passe despercebido)
          const { data: myLike } = await supabase
            .from("matches")
            .select("id")
            .eq("user_id", myId)
            .eq("target_user_id", partnerId)
            .eq("action", "like")
            .maybeSingle();

          const { data: partnerLike } = await supabase
            .from("matches")
            .select("id")
            .eq("user_id", partnerId)
            .eq("target_user_id", myId)
            .eq("action", "like")
            .maybeSingle();

          if (!cancelled) {
            setHasMutualMatch(!!(myLike && partnerLike));
          }
        }
      });

    return () => { cancelled = true; };
  }, [myId, partnerId, dbPartner]);

  const { messages, loading, sendText, sendMedia, sendAudio, sendGift, sendLockedMedia } = useChat(partnerId);

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
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Private media modal state
  const [privFile, setPrivFile] = useState<File | null>(null);
  const [privPrice, setPrivPrice] = useState("50");
  const [privPreview, setPrivPreview] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    await sendText(content);

    // Auto-reply for demo profiles
    if (dbPartner?.is_demo) {
      setTimeout(() => {
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        sendText(reply);
      }, 1500);
    }
  };

  const handleSendGift = async (giftId: string, coinCost: number) => {
    const success = actions.spendCoins(coinCost);
    if (!success) {
      toast.error("Moedas insuficientes! Recarregue na loja.");
      return;
    }
    const g = gifts.find((item) => item.id === giftId);
    setGiftOpen(false);
    await sendGift(giftId, coinCost);
    toast.success(`Você enviou um(a) ${g?.name ?? "Mimo"}! 🎁`);
  };

  const handleSelectPrivFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPrivFile(file);
    setPrivPreview(URL.createObjectURL(file));
  };

  const handleSendPrivMedia = async () => {
    if (!privFile) return;
    const price = Number.parseInt(privPrice, 10) || 50;
    const isVideo = privFile.type.startsWith("video/");
    setPrivMediaOpen(false);
    toast.info("Enviando mídia privada...");
    await sendLockedMedia(privFile, price, isVideo);
    setPrivFile(null);
    setPrivPreview(null);
    toast.success("Mídia trancada enviada!");
  };

  const handleUnlockMedia = async (msg: LocalMessage) => {
    if (!msg.price) return;
    const success = actions.spendCoins(msg.price);
    if (!success) {
      toast.error(`Moedas insuficientes! Requer ${msg.price} moedas.`);
      return;
    }
    actions.unlockMedia(msg.id);
    toast.success("Mídia desbloqueada! 🔥");
  };

  const startRecording = () => {
    setRecording(true);
    setRecordSecs(0);
    recordTimer.current = setInterval(() => {
      setRecordSecs((s) => s + 1);
    }, 1000);
  };

  const stopRecordingAndSend = async () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    const secs = recordSecs;
    setRecordSecs(0);
    if (secs < 1) {
      toast.error("Áudio muito curto.");
      return;
    }
    // Dummy audio send
    const dummyBlob = new Blob(["audio"], { type: "audio/webm" });
    const file = new File([dummyBlob], "audio.webm", { type: "audio/webm" });
    await sendAudio(file, secs);
  };

  const cancelRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    setRecordSecs(0);
  };

  const handleNormalMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    toast.info("Enviando mídia...");
    await sendMedia(file, isVideo);
  };

  const handleSendReport = () => {
    if (!reportSubject) {
      toast.error("Selecione um motivo.");
      return;
    }
    setReportOpen(false);
    toast.success("Denúncia enviada com sucesso. Nossa equipe analisará em até 24h.");
    setReportSubject("");
    setReportDesc("");
  };

  // ---------------------------------------------------------------------------
  // RENDER CONDITIONAL STATES
  // ---------------------------------------------------------------------------

  if (hasMutualMatch === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (hasMutualMatch === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-surface-2 mb-4">
          <Heart className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Match necessário</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Você e {partnerName} precisam dar match mútuo antes de conversar.
        </p>
        <Link to="/" className="mt-6 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-white">
          Descobrir perfis
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/mensagens" className="tap-scale p-1">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="relative">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={partnerName} className="size-10 rounded-full object-cover" />
            ) : (
              <div className="size-10 rounded-full bg-surface-2" />
            )}
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div>
            <h1 className="text-sm font-bold">{partnerName}</h1>
            <p className="text-[11px] text-emerald-500">Online agora</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => toast.info("Chamada de voz em breve!")} className="tap-scale p-2 text-muted-foreground hover:text-foreground">
            <Phone className="size-4" />
          </button>
          <button onClick={() => toast.info("Chamada de vídeo em breve!")} className="tap-scale p-2 text-muted-foreground hover:text-foreground">
            <Video className="size-4" />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="tap-scale p-2 text-muted-foreground hover:text-foreground">
            <MoreVertical className="size-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-4 top-14 z-50 w-48 rounded-2xl border border-border bg-surface p-2 shadow-xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setMenuOpen(false);
                setReportOpen(true);
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              Denunciar / Bloquear
            </button>
          </div>
        )}
      </header>

      {/* Messages Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Heart className="size-12 text-primary/40 animate-pulse mb-2" />
            <p className="text-sm font-medium">Vocês deram Match! 🔥</p>
            <p className="text-xs">Diga um oi para começar a conversa.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === myId;
            const isUnlocked = unlocked[m.id];

            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe
                      ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-none"
                      : "bg-surface border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  {/* Text Message */}
                  {m.type === "text" && <p>{m.content}</p>}

                  {/* Gift Message */}
                  {m.type === "gift" && (
                    <div className="flex items-center gap-2 py-1">
                      <Gift className="size-6 text-gold animate-bounce" />
                      <div>
                        <p className="font-bold text-xs">Mimo Enviado! 🎁</p>
                        <p className="text-[10px] opacity-80">{m.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Audio Message */}
                  {m.type === "audio" && (
                    <div className="flex items-center gap-3 py-1 min-w-[140px]">
                      <button className="grid size-8 place-items-center rounded-full bg-white/20 text-current">
                        <Play className="size-4 fill-current" />
                      </button>
                      <div className="flex-1">
                        <div className="h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
                          <div className="h-full w-1/3 bg-current rounded-full" />
                        </div>
                        <span className="text-[10px] opacity-75 mt-1 block">0:{m.duration ?? "05"}</span>
                      </div>
                    </div>
                  )}

                  {/* Free Media */}
                  {m.type === "media" && (
                    <div className="overflow-hidden rounded-xl mt-1">
                      {m.is_video ? (
                        <video src={m.media_url!} controls className="max-h-60 rounded-xl object-cover" />
                      ) : (
                        <img src={m.media_url!} alt="Mídia" className="max-h-60 rounded-xl object-cover" />
                      )}
                    </div>
                  )}

                  {/* Locked/Private Media */}
                  {m.type === "locked_media" && (
                    <div className="relative overflow-hidden rounded-xl mt-1 min-w-[200px]">
                      {isMe || isUnlocked ? (
                        m.is_video ? (
                          <video src={m.media_url!} controls className="max-h-60 rounded-xl object-cover" />
                        ) : (
                          <img src={m.media_url!} alt="Mídia Exclusiva" className="max-h-60 rounded-xl object-cover" />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-md text-white text-center rounded-xl border border-white/10">
                          <Lock className="size-8 text-gold mb-2" />
                          <p className="text-xs font-bold uppercase tracking-wider text-gold">Conteúdo Trancado</p>
                          <p className="text-[11px] text-white/80 mt-1">Desbloqueie para visualizar</p>
                          <button
                            onClick={() => handleUnlockMedia(m)}
                            className="mt-3 flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-black shadow-lg tap-scale"
                          >
                            <Coins className="size-3.5 fill-black" />
                            {m.price} Moedas
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <span className="mt-1 block text-right text-[9px] opacity-60">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input / Control Bar */}
      <footer className="sticky bottom-0 z-20 border-t border-border bg-background p-3">
        {recording ? (
          <div className="flex items-center justify-between rounded-full bg-destructive/10 px-4 py-2 text-destructive">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-destructive animate-ping" />
              <span className="text-xs font-bold">Gravando áudio... 0:{recordSecs < 10 ? `0${recordSecs}` : recordSecs}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={cancelRecording} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
              <button onClick={stopRecordingAndSend} className="rounded-full bg-destructive p-2 text-white tap-scale">
                <Send className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setGiftOpen(true)} className="p-2 text-gold hover:opacity-80 tap-scale">
              <Gift className="size-5" />
            </button>

            {isCreator && (
              <button onClick={() => setPrivMediaOpen(true)} className="p-2 text-primary hover:opacity-80 tap-scale">
                <Lock className="size-5" />
              </button>
            )}

            <button onClick={() => mediaInputRef.current?.click()} className="p-2 text-muted-foreground hover:text-foreground tap-scale">
              <ImagePlus className="size-5" />
            </button>
            <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleNormalMediaUpload} />

            <div className="flex flex-1 items-center rounded-full border border-border bg-surface px-4 py-1.5">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                placeholder="Escreva uma mensagem..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {text.trim() ? (
              <button onClick={handleSendText} className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-primary to-accent text-white tap-scale shadow-md">
                <Send className="size-4" />
              </button>
            ) : (
              <button onClick={startRecording} className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted-foreground hover:text-foreground tap-scale">
                <Mic className="size-4" />
              </button>
            )}
          </div>
        )}
      </footer>

      {/* Gift Modal */}
      {giftOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Gift className="size-4 text-gold" /> Enviar Mimo Virtual
              </h3>
              <button onClick={() => setGiftOpen(false)} className="p-1 text-muted-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 my-4">
              {gifts.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSendGift(g.id, g.coins)}
                  className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-3 hover:border-gold tap-scale"
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-xs font-bold mt-1">{g.name}</span>
                  <span className="text-[10px] text-gold
