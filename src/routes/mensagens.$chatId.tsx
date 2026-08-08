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
              .from("chat-media") // <--- Alterado para chat-media
              .upload(`chat-audio/${fileName}`, blob, { contentType: "audio/webm" });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage
              .from("chat-media") // <--- Alterado para chat-media
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
            ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-medium"
            : "bg-[#1C1C24] text-white border border-white/5"
        }`}
      >
        
