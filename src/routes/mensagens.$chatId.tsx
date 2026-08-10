import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Coins,
  Flag,
  Gift,
  ImagePlus,
  Mic,
  MoreVertical,
  Pause,
  PhoneOff,
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
import { Lightbox } from "@/components/hotmatch/Lightbox";

export const Route = createFileRoute("/mensagens/$chatId")({
  component: ChatRoute,
});

function ChatRoute() {
  const { chatId } = useParams({ from: "/mensagens/$chatId" });
  const navigate = useNavigate();
  const { profileId, coins } = useAppState();
  const myId = profileId ?? "";
  const partnerId = chatId;

  const { profiles: dbProfiles } = useProfiles();
  const dbPartner = dbProfiles.find((p) => p.id === partnerId);
  const partnerName = dbPartner?.name ?? "Conversa";
  const partnerAvatar = dbPartner?.avatar_url ?? null;

  const { messages, sendMessage, sendAudioMessage, sendGiftMessage, sendMediaMessage } = useChat({
    partnerId,
    partnerName,
    isDemo: dbPartner?.is_demo,
  });

  const [inputText, setInputText] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioSecondsRef = useRef(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText, "text");
    setInputText("");
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

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Selecione uma imagem ou vídeo.");
      return;
    }
    toast.loading("Enviando mídia...", { id: "media-upload" });
    try {
      const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
      const fileName = `media_${Date.now()}.${ext}`;
      const folder = isVideo ? "chat-video" : "chat-photo";
      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(`${folder}/${fileName}`, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("chat-media")
        .getPublicUrl(`${folder}/${fileName}`);
      await sendMediaMessage(urlData.publicUrl, isVideo ? "vídeo" : "foto");
      toast.success("Mídia enviada!", { id: "media-upload" });
    } catch (err) {
      toast.error("Erro ao enviar mídia.", { id: "media-upload" });
      console.error(err);
    } finally {
      e.target.value = "";
    }
  };

  const startAudioRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const seconds = audioSecondsRef.current;
        if (blob.size > 0 && seconds > 0) {
          toast.loading("Enviando áudio...", { id: "audio-upload" });
          try {
            const fileName = `audio_${Date.now()}.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
            const { error: uploadError } = await supabase.storage
              .from("chat-media")
              .upload(`chat-audio/${fileName}`, blob, { contentType: mimeType });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage
              .from("chat-media")
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
      audioSecondsRef.current = 0;
      audioIntervalRef.current = setInterval(() => {
        audioSecondsRef.current += 1;
        setAudioTimer(audioSecondsRef.current);
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

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0B0B0E] text-white">
      <div className="flex items-center justify-between px-4 py-3 bg-[#121218]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/mensagens" className="text-white/70 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <button
            onClick={() => navigate({ to: "/perfil", search: { uid: partnerId, from: chatId } })}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <img
                src={partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border border-[#FFD700]/30"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0B0E]" />
            </div>
            <div className="text-left">
              <h2 className="font-semibold text-sm leading-tight text-white">{partnerName}</h2>
              <span className="text-[10px] text-green-400 font-medium">Online agora</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 text-white/80">
          <button onClick={() => setShowGiftModal(true)} className="p-2 hover:bg-white/5 rounded-full transition">
            <Gift className="w-5 h-5 text-[#FFD700]" />
          </button>
          <button onClick={() => setShowMenu((v) => !v)} className="p-2 hover:bg-white/5 rounded-full transition">
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-4 top-14 z-40 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C24] shadow-2xl">
              <button
                onClick={() => { setShowMenu(false); toast.success("Usuário bloqueado."); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5"
              >
                <Ban className="w-4 h-4 text-red-400" /> Bloquear
              </button>
              <button
                onClick={() => { setShowMenu(false); setShowReport(true); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 border-t border-white/5"
              >
                <Flag className="w-4 h-4 text-orange-400" /> Denunciar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onImageClick={setLightboxImage} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#121218] border-t border-white/10 sticky bottom-0 z-20">
        {isRecording ? (
          <div className="flex items-center justify-between bg-[#1C1C24] px-4 py-3 rounded-full border border-red-500/50">
            <span className="text-sm font-medium text-red-400">Gravando áudio... {audioTimer}s</span>
            <button onClick={stopAudioRecord} className="bg-[#FFD700] text-black px-4 py-1.5 rounded-full text-xs font-bold">
              Enviar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-[#FFD700] hover:bg-white/5 rounded-full">
              <ImagePlus className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
            <button onClick={startAudioRecord} className="p-2.5 text-white/70 hover:text-white rounded-full">
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
            <button onClick={handleSend} className="p-2.5 bg-[#FFD700] text-black rounded-full">
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {showGiftModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setShowGiftModal(false)}>
          <div className="bg-[#121218] w-full max-w-lg rounded-t-3xl p-6 border-t border-white/10 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#FFD700]">Enviar Presente</h3>
              <button onClick={() => setShowGiftModal(false)} className="text-white/50"><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {gifts.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSendGift(g)}
                  className="bg-[#1C1C24] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="text-xs font-semibold">{g.name}</span>
                  <span className="text-[10px] text-[#FFD700] font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {g.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lightboxImage && <Lightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </div>
  );
}

function MessageBubble({ msg, onImageClick }: { msg: LocalMessage; onImageClick?: (url: string) => void }) {
  const isMe = msg.from === "me";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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
    const onTimeUpdate = () => {
      if (el.duration > 0) setProgress((el.currentTime / el.duration) * 100);
    };
    const onEnded = () => { setPlaying(false); setProgress(0); };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-[#FFD700] text-black font-medium" : "bg-[#1C1C24] text-white border border-white/5"}`}>
        {msg.kind === "audio" && msg.media ? (
          <div className="flex items-center gap-3 min-w-[160px]">
            <button onClick={togglePlay} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-black text-[#FFD700]" : "bg-[#FFD700] text-black"}`}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full ${isMe ? "bg-black" : "bg-[#FFD700]"}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
            <audio ref={audioRef} src={msg.media} preload="metadata" />
          </div>
        ) : msg.kind === "foto" && msg.media ? (
          <div className="space-y-1 cursor-pointer" onClick={() => onImageClick?.(msg.media!)}>
            <img src={msg.media} alt="Foto" className="rounded-xl max-w-xs object-cover max-h-60" />
            {msg.text && <p className="pt-1">{msg.text}</p>}
          </div>
        ) : msg.kind === "gift" ? (
          <div className="text-center space-y-1 py-1">
            <span className="text-3xl block">{msg.media || "🎁"}</span>
            <p className="font-bold text-xs">{msg.text}</p>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        )}
      </div>
    </div>
  );
            }
        
