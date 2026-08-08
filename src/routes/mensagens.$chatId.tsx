import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Coins,
  Flag,
  Gift,
  Lock,
  Mic,
  MoreVertical,
  Phone,
  PhoneOff,
  Play,
  Pause,
  Send,
  Shield,
  Video,
  VideoOff,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { gifts } from "@/lib/hotmatch/data";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { useChat, type LocalMessage } from "@/hooks/use-chat";
import { useProfiles } from "@/hooks/use-profiles";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mensagens/$chatId")({
  component: Chat,
});

function Chat() {
  const { chatId } = useParams({ from: "/mensagens/$chatId" });
  const { unlocked, profileId, gender, coins } = useAppState();
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
          if (cancelled) return;
          if (myLike) {
            const { data: partnerLike } = await supabase
              .from("matches")
              .select("id")
              .eq("user_id", partnerId)
              .eq("target_user_id", myId)
              .eq("action", "like")
              .maybeSingle();
            if (cancelled) return;
            setHasMutualMatch(!!partnerLike);
          } else {
            setHasMutualMatch(false);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [myId, partnerId, dbPartner]);

  const { messages, sendMessage, sendAudioMessage, sendGiftMessage } = useChat({
    partnerId,
    partnerName,
    isDemo: dbPartner?.is_demo,
  });

  const [inputText, setInputText] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingText, setPendingText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Call state
  const [callState, setCallState] = useState<"idle" | "voice" | "video">("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (!isCreator && !unlocked && !dbPartner?.is_demo && hasMutualMatch === false) {
      setPendingText(inputText);
      setShowPaywall(true);
      return;
    }
    sendMessage(inputText, "text");
    setInputText("");
  };

  const handleUnlockAndSend = () => {
    actions.unlockChat();
    setShowPaywall(false);
    if (pendingText) {
      sendMessage(pendingText, "text");
      setPendingText("");
    }
    toast.success("Chat desbloqueado com sucesso!");
  };

  const handleSendGift = (gift: (typeof gifts)[0]) => {
    setShowGiftModal(false);
    if (coins < gift.price) {
      toast.error(`Saldo insuficiente. Você precisa de ${gift.price} moedas.`);
      return;
    }
    sendGiftMessage(gift.emoji, gift.name, gift.price);
    actions.spendCoins(gift.price);
    toast.success(`Você enviou ${gift.name}!`);
  };

  // ── Audio recording ────────────────────────────────────────────────────────
  const startAudioRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const seconds = audioTimer;
        if (blob.size > 0 && seconds > 0) {
          toast.loading("Enviando áudio...", { id: "audio-upload" });
          try {
            const fileName = `audio_${Date.now()}.webm`;
            const { error: uploadError } = await supabase.storage
              .from("photos")
              .upload(`chat-audio/${fileName}`, blob, { contentType: "audio/webm" });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage
              .from("photos")
              .getPublicUrl(`chat-audio/${fileName}`);
            await sendAudioMessage(urlData.publicUrl, seconds);
            toast.success("Áudio enviado!", { id: "audio-upload" });
          } catch (err) {
            toast.error("Erro ao enviar áudio.", { id: "audio-upload" });
            console.error(err);
          }
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setAudioTimer(0);
      audioIntervalRef.current = setInterval(() => {
        setAudioTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Não foi possível acessar o microfone.");
      console.error(err);
    }
  };

  const stopAudioRecord = () => {
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioTimer(0);
  };

  // ── Block / Report ──────────────────────────────────────────────────────────
  const handleBlock = () => {
    setShowMenu(false);
    toast.success(`${partnerName} foi bloqueado. Você não receberá mais mensagens desta pessoa.`);
  };

  const handleReportSubmit = async (subject: string, description: string) => {
    if (!subject.trim()) {
      toast.error("Por favor, preencha o assunto.");
      return;
    }
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: myId || null,
        reported_user_id: partnerId || null,
        subject: subject.trim(),
        description: description.trim() || null,
      });
      if (error) throw error;
      toast.success("Denúncia enviada. Nossa equipe irá analisar.");
      setShowReport(false);
    } catch (err) {
      toast.error("Erro ao enviar denúncia. Tente novamente.");
      console.error(err);
    }
  };

  // ── Call handlers ───────────────────────────────────────────────────────────
  const startCall = async (type: "voice" | "video") => {
    try {
      const constraints = type === "video" ? { audio: true, video: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Store stream for cleanup
      (startCall as any)._stream = stream;
      setCallState(type);
    } catch {
      toast.error("Não foi possível acessar o microfone/câmera.");
    }
  };

  const endCall = () => {
    const stream = (startCall as any)._stream as MediaStream | undefined;
    stream?.getTracks().forEach((t) => t.stop());
    (startCall as any)._stream = null;
    setCallState("idle");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      const stream = (startCall as any)._stream as MediaStream | undefined;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0B0B0E] text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#121218]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/mensagens" className="text-white/70 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="relative">
            <img
              src={partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
              alt={partnerName}
              className="w-10 h-10 rounded-full object-cover border border-[#FFD700]/30"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0B0E]" />
          </div>
          <div>
            <h2 className="font-semibold text-sm leading-tight text-white flex items-center gap-1">
              {partnerName}
            </h2>
            <span className="text-[10px] text-green-400 font-medium">Online agora</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/80">
          <button
            onClick={() => startCall("voice")}
            className="p-2 hover:bg-white/5 rounded-full transition"
            title="Chamada de voz"
          >
            <Phone className="w-5 h-5 text-[#FFD700]" />
          </button>
          <button
            onClick={() => startCall("video")}
            className="p-2 hover:bg-white/5 rounded-full transition"
            title="Chamada de vídeo"
          >
            <Video className="w-5 h-5 text-[#FFD700]" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-2 hover:bg-white/5 rounded-full transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-40 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C24] shadow-2xl">
                  <button
                    onClick={handleBlock}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
                  >
                    <Ban className="w-4 h-4 text-red-400" />
                    Bloquear
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowReport(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition border-t border-white/5"
                  >
                    <Flag className="w-4 h-4 text-orange-400" />
                    Denunciar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="text-[10px] bg-white/5 text-white/50 px-3 py-1 rounded-full uppercase tracking-wider border border-white/5">
            Conexão segura HotMatch
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 bg-[#121218] border-t border-white/10 sticky bottom-0 z-20">
        {isRecording ? (
          <div className="flex items-center justify-between bg-[#1C1C24] px-4 py-3 rounded-full border border-red-500/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                Gravando áudio... {Math.floor(audioTimer / 60)}:{audioTimer % 60 < 10 ? `0${audioTimer % 60}` : audioTimer % 60}
              </span>
            </div>
            <button
              onClick={stopAudioRecord}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-4 py-1.5 rounded-full text-xs font-bold"
            >
              Enviar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGiftModal(true)}
              className="p-2.5 text-[#FFD700] hover:bg-white/5 rounded-full transition"
            >
              <Gift className="w-5 h-5" />
            </button>
            <button
              onClick={startAudioRecord}
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-[#1C1C24] text-white placeholder-white/40 text-sm px-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-[#FFD700]"
            />
            <button
              onClick={handleSend}
              className="p-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-full hover:opacity-90 transition shadow-md shadow-[#FFD700]/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE PRESENTES */}
      {showGiftModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setShowGiftModal(false)}
        >
          <div
            className="bg-[#121218] w-full max-w-lg rounded-t-3xl p-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#FFD700]">
                <Gift className="w-5 h-5" /> Enviar Presente
              </h3>
              <button onClick={() => setShowGiftModal(false)} className="text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {gifts.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSendGift(g)}
                  className="group relative bg-[#1C1C24] hover:border-[#FFD700] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:scale-105"
                >
                  {/* Gradient glow ring on hover */}
                  <span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                    style={{ background: `radial-gradient(circle at center, ${g.color}, transparent 70%)` }}
                  />
                  <span
                    className="grid size-14 place-items-center rounded-full text-3xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${g.color}22`, boxShadow: `0 4px 20px ${g.color}33` }}
                  >
                    {g.emoji}
                  </span>
                  <span className="text-xs font-semibold text-white">{g.name}</span>
                  <span className="text-[10px] text-[#FFD700] font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {g.price}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-white/40">
              Seu saldo: {coins} moedas
            </p>
          </div>
        </div>
      )}

      {/* PAYWALL DE CHAT */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-white/10 w-full max-w-sm rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full flex items-center justify-center mx-auto text-[#FFD700]">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Desbloquear Chat Ilimitado</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Para conversar livremente e trocar mensagens com {partnerName}, desbloqueie o acesso VIP completo.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleUnlockAndSend}
                className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold rounded-full text-sm shadow-lg shadow-[#FFD700]/20 hover:opacity-90 transition"
              >
                Desbloquear Agora (Acesso VIP)
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="w-full py-2.5 text-white/50 hover:text-white text-xs font-medium transition"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DENÚNCIA */}
      {showReport && (
        <ReportModal
          partnerName={partnerName}
          onClose={() => setShowReport(false)}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* CALL OVERLAY */}
      {callState !== "idle" && (
        <CallOverlay
          type={callState}
          partnerName={partnerName}
          partnerAvatar={partnerAvatar}
          onEnd={endCall}
        />
      )}
    </div>
  );
}

/* ── Message bubble with audio player ─────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: LocalMessage }) {
  const isMe = msg.from === "me";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setPlaying(false);
    el.addEventListener("ended", onEnded);
    return () => el.removeEventListener("ended", onEnded);
  }, []);

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isMe
            ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-medium rounded-br-none shadow-lg shadow-[#FFD700]/10"
            : "bg-[#1C1C24] text-white rounded-bl-none border border-white/5"
        }`}
      >
        {msg.kind === "audio" ? (
          <div className="flex items-center gap-3 py-1 min-w-[180px]">
            <button
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isMe ? "bg-black/20 text-black" : "bg-[#FFD700] text-black"
              }`}
            >
              {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <Volume2 className={`w-3 h-3 ${isMe ? "text-black/60" : "text-white/40"}`} />
                <span className={`text-[10px] ${isMe ? "text-black/60" : "text-white/50"}`}>
                  {msg.seconds ? `${Math.floor(msg.seconds / 60)}:${msg.seconds % 60 < 10 ? `0${msg.seconds % 60}` : msg.seconds % 60}` : "0:00"}
                </span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${isMe ? "bg-black/30" : "bg-white/20"}`}>
                <div className={`h-full rounded-full ${isMe ? "bg-black/50" : "bg-[#FFD700]"} ${playing ? "w-2/3" : "w-1/3"} transition-all`} />
              </div>
            </div>
            {msg.media && <audio ref={audioRef} src={msg.media} preload="metadata" />}
          </div>
        ) : (
          <p className="leading-relaxed">{msg.text}</p>
        )}
        <span className={`block text-[9px] mt-1 text-right ${isMe ? "text-black/60" : "text-white/40"}`}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

/* ── Report modal ─────────────────────────────────────────────────────────────── */
function ReportModal({
  partnerName,
  onClose,
  onSubmit,
}: {
  partnerName: string;
  onClose: () => void;
  onSubmit: (subject: string, description: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    onSubmit(subject, description);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-white/10 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-orange-500/15 border border-orange-500/30">
              <Flag className="w-5 h-5 text-orange-400" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Denunciar {partnerName}</h3>
              <p className="text-[11px] text-white/50">Sua denúncia será analisada pela nossa equipe</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Assunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Comportamento inadequado"
              className="w-full bg-[#1C1C24] text-white text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-orange-400 placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que aconteceu..."
              rows={4}
              className="w-full bg-[#1C1C24] text-white text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-orange-400 placeholder:text-white/30 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-white/10 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !subject.trim()}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold disabled:opacity-50 transition"
          >
            Enviar denúncia
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Call overlay (WebRTC-prepared UI) ────────────────────────────────────────── */
function CallOverlay({
  type,
  partnerName,
  partnerAvatar,
  onEnd,
}: {
  type: "voice" | "video";
  partnerName: string;
  partnerAvatar: string | null;
  onEnd: () => void;
}) {
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const stream = (startCall as any)._stream as MediaStream | undefined;
    if (type === "video" && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [type]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? `0${s % 60}` : s % 60}`;

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-b from-[#1a1a2e] to-[#0B0B0E] flex flex-col items-center justify-between p-6 animate-in fade-in duration-200">
      {/* Top: partner info */}
      <div className="flex flex-col items-center gap-3 pt-8">
        <div className="relative">
          {type === "video" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-40 h-40 rounded-full object-cover border-2 border-[#FFD700]/40"
            />
          ) : (
            <img
              src={partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
              alt={partnerName}
              className="w-40 h-40 rounded-full object-cover border-2 border-[#FFD700]/40"
            />
          )}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0B0B0E] flex items-center justify-center">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{partnerName}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-400 font-medium">
            {type === "video" ? "Vídeo" : "Voz"} · {fmtTime(duration)}
          </span>
        </div>
      </div>

      {/* Center: status */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          {type === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          <span>Chamada em andamento via WebRTC</span>
        </div>
      </div>

      {/* Bottom: controls */}
      <div className="flex items-center gap-6 pb-8">
        <button className="grid size-14 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
          {type === "video" ? <VideoOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={onEnd}
          className="grid size-16 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
        <button className="grid size-14 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
          <Volume2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
