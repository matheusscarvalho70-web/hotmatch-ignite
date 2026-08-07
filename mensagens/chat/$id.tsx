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

export const Route = createFileRoute("/mensagens/chat/$id")({
  component: Chat,
});

const AUTO_REPLIES = [
  "Que delícia de mensagem 😜",
  "Você me deixa tão animada!",
  "rs adorei 😍",
  "Sério mesmo? Conta mais kk",
];

function Chat() {
  const { id: chatId } = useParams({ from: "/mensagens/chat/$id" });
  const { unlocked, profileId, gender } = useAppState();
  const isCreator = gender === "female";
  const myId = profileId ?? "";
  const partnerId = chatId;

  const { profiles: dbProfiles } = useProfiles();
  const dbPartner = dbProfiles.find((p) => p.id === partnerId);
  const partnerName = dbPartner?.name ?? "Conversa";
  const partnerAvatar = dbPartner?.avatar_url ?? null;

  const [hasMutualMatch, setHasMutualMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (!myId || !partnerId) return;
    if (dbPartner === undefined) return;
    if (dbPartner?.is_demo) { 
      setHasMutualMatch(true); 
      return; 
    }

    let cancelled = false;
    const [u1, u2] = [myId, partnerId].sort();

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

          if (!cancelled) setHasMutualMatch(!!(myLike && partnerLike));
        }
      });

    return () => { 
      cancelled = true; 
    };
  }, [myId, partnerId, dbPartner]);

  const { messages, loading, sendText, sendMedia, sendAudio, sendGift, sendLockedMedia } = useChat(partnerId);

  const [text, setText] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [privMediaOpen, setPrivMediaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

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
    if (dbPartner?.is_demo) {
      setTimeout(() => {
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        sendText(reply);
      }, 1500);
    }
  };

  const handleSendGift = async (giftId: string, coinCost: number) => {
    if (!actions.spendCoins(coinCost)) {
      toast.error("Moedas insuficientes!");
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
    await sendLockedMedia(privFile, price, isVideo);
    setPrivFile(null);
    setPrivPreview(null);
    toast.success("Mídia trancada enviada!");
  };

  const handleUnlockMedia = async (msg: LocalMessage) => {
    if (!msg.price) return;
    if (!actions.spendCoins(msg.price)) {
      toast.error("Moedas insuficientes!");
      return;
    }
    actions.unlockMedia(msg.id);
    toast.success("Mídia desbloqueada! 🔥");
  };

  const startRecording = () => {
    setRecording(true);
    setRecordSecs(0);
    recordTimer.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  };

  const stopRecordingAndSend = async () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    const secs = recordSecs;
    setRecordSecs(0);
    if (secs < 1) return;
    const dummyBlob = new Blob(["audio"], { type: "audio/webm" });
    await sendAudio(new File([dummyBlob], "audio.webm", { type: "audio/webm" }), secs);
  };

  const cancelRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    setRecordSecs(0);
  };

  const handleNormalMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendMedia(file, file.type.startsWith("video/"));
  };

  if (hasMutualMatch === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (hasMutualMatch === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
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
          <button onClick={() => toast.info("Em breve!")} className="tap-scale p-2 text-muted-foreground">
            <Phone className="size-4" />
          </button>
          <button onClick={() => toast.info("Em breve!")} className="tap-scale p-2 text-muted-foreground">
            <Video className="size-4" />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="tap-scale p-2 text-muted-foreground">
            <MoreVertical className="size-4" />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-4 top-14 z-50 w-48 rounded-2xl border border-border bg-surface p-2 shadow-xl">
            <button onClick={() => { setMenuOpen(false); setReportOpen(true); }} className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10">
              Denunciar / Bloquear
            </button>
          </div>
        )}
      </header>

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
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-none" : "bg-surface border border-border text-foreground rounded-bl-none"}`}>
                  {m.type === "text" && <p>{m.content}</p>}
                  {m.type === "gift" && (
                    <div className="flex items-center gap-2 py-1">
                      <Gift className="size-6 text-gold animate-bounce" />
                      <div><p className="font-bold text-xs">Mimo Enviado! 🎁</p><p className="text-[10px] opacity-80">{m.content}</p></div>
                    </div>
                  )}
                  {m.type === "audio" && (
                    <div className="flex items-center gap-3 py-1 min-w-[140px]">
                      <button className="grid size-8 place-items-center rounded-full bg-white/20"><Play className="size-4 fill-current" /></button>
                      <div className="flex-1"><div className="h-1.5 w-full rounded-full bg-white/30"><div className="h-full w-1/3 bg-current rounded-full" /></div><span className="text-[10px] opacity-75 mt-1 block">0:{m.duration ?? "05"}</span></div>
                    </div>
                  )}
                  {m.type === "media" && (
                    <div className="overflow-hidden rounded-xl mt-1">
                      {m.is_video ? <video src={m.media_url!} controls className="max-h-60 rounded-xl object-cover" /> : <img src={m.media_url!} alt="Mídia" className="max-h-60 rounded-xl object-cover" />}
                    </div>
                  )}
                  {m.type === "locked_media" && (
                    <div className="relative overflow-hidden rounded-xl mt-1 min-w-[200px]">
                      {isMe || isUnlocked ? (
                        m.is_video ? <video src={m.media_url!} controls className="max-h-60 rounded-xl object-cover" /> : <img src={m.media_url!} alt="Privada" className="max-h-60 rounded-xl object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-md text-white text-center rounded-xl border border-white/10">
                          <Lock className="size-8 text-gold mb-2" />
                          <p className="text-xs font-bold uppercase tracking-wider text-gold">Conteúdo Trancado</p>
                          <button onClick={() => handleUnlockMedia(m)} className="mt-3 flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-black tap-scale">
                            <Coins className="size-3.5 fill-black" /> {m.price} Moedas
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

      <footer className="sticky bottom-0 z-20 border-t border-border bg-background p-3">
        {recording ? (
          <div className="flex items-center justify-between rounded-full bg-destructive/10 px-4 py-2 text-destructive">
            <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-destructive animate-ping" /><span className="text-xs font-bold">Gravando... 0:{recordSecs < 10 ? `0${recordSecs}` : recordSecs}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={cancelRecording} className="p-1"><X className="size-5" /></button>
              <button onClick={stopRecordingAndSend} className="rounded-full bg-destructive p-2 text-white"><Send className="size-4" /></button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setGiftOpen(true)} className="p-2 text-gold tap-scale"><Gift className="size-5" /></button>
            {isCreator && <button onClick={() => setPrivMediaOpen(true)} className="p-2 text-primary tap-scale"><Lock className="size-5" /></button>}
            <button onClick={() => mediaInputRef.current?.click()} className="p-2 text-muted-foreground tap-scale"><ImagePlus className="size-5" /></button>
            <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleNormalMediaUpload} />
            <div className="flex flex-1 items-center rounded-full border border-border bg-surface px-4 py-1.5">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendText()} placeholder="Escreva uma mensagem..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            {text.trim() ? (
              <button onClick={handleSendText} className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md"><Send className="size-4" /></button>
            ) : (
              <button onClick={startRecording} className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted-foreground"><Mic className="size-4" /></button>
            )}
          </div>
        )}
      </footer>

      {giftOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><Gift className="size-4 text-gold" /> Enviar Mimo</h3>
              <button onClick={() => setGiftOpen(false)} className="p-1 text-muted-foreground"><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 my-4">
              {gifts.map((g) => (
                <button key={g.id} onClick={() => handleSendGift(g.id, g.coins)} className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-3 hover:border-gold tap-scale">
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-xs font-bold mt-1">{g.name}</span>
                  <span className="text-[10px] text-gold flex items-center gap-0.5 mt-0.5"><Coins className="size-3" /> {g.coins}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {privMediaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2"><Lock className="size-4 text-primary" /> Vender Mídia</h3>
              <button onClick={() => setPrivMediaOpen(false)} className="p-1 text-muted-foreground"><X className="size-4" /></button>
            </div>
            <div className="my-4 space-y-4">
              {privPreview ? (
                <div className="relative max-h-48 overflow-hidden rounded-2xl border border-border">
                  <img src={privPreview} alt="Preview" className="w-full object-cover" />
                  <button onClick={() => setPrivPreview(null)} className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white"><X className="size-4" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 cursor-pointer hover:border-primary">
                  <ImagePlus className="size-8 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold">Escolher foto ou vídeo</span>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleSelectPrivFile} />
                </label>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Preço em Moedas:</label>
                <input type="number" value={privPrice} onChange={(e) => setPrivPrice(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold outline-none" />
              </div>
              <button disabled={!privFile} onClick={handleSendPrivMedia} className="w-full rounded-full bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-white disabled:opacity-50">
                Trancar e Enviar 🔒
              </button>
            </div>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-destructive">Denunciar Usuário</h3>
              <button onClick={() => setReportOpen(false)} className="p-1 text-muted-foreground"><X className="size-4" /></button>
            </div>
            <div className="my-4 space-y-3">
              {["Comportamento Inadequado", "Spam ou Golpe", "Perfil Falso", "Conteúdo Ofensivo"].map((reason) => (
                <button key={reason} onClick={() => setReportSubject(reason)} className={`w-full rounded-xl border p-3 text-left text-xs font-medium ${reportSubject === reason ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-background"}`}>
                  {reason}
                </button>
  
