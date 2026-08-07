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
  "Que delicia de mensagem 😘",
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

  const { messages, sendMessage } = useChat({
    partnerId,
    partnerName,
    isDemo: dbPartner?.is_demo,
  });

  const [inputText, setInputText] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingText, setPendingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const audioIntervalRef = useRef<any>(null);

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
    sendMessage(`🎁 Presente enviado: ${gift.name} (${gift.coins} moedas)`, "gift");
    toast.success(`Você enviou ${gift.name}!`);
  };

  const startAudioRecord = () => {
    setIsRecording(true);
    setAudioTimer(0);
    audioIntervalRef.current = setInterval(() => {
      setAudioTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopAudioRecord = () => {
    clearInterval(audioIntervalRef.current);
    setIsRecording(false);
    if (audioTimer > 0) {
      sendMessage(`🎤 Áudio (${audioTimer}s)`, "audio");
    }
    setAudioTimer(0);
  };

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
          <button onClick={() => toast("Ligação de voz iniciada...")} className="p-2 hover:bg-white/5 rounded-full">
            <Phone className="w-5 h-5 text-[#FFD700]" />
          </button>
          <button onClick={() => toast("Videochamada iniciada...")} className="p-2 hover:bg-white/5 rounded-full">
            <Video className="w-5 h-5 text-[#FFD700]" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="text-[10px] bg-white/5 text-white/50 px-3 py-1 rounded-full uppercase tracking-wider border border-white/5">
            Conexão segura HotMatch
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === "me";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-medium rounded-br-none shadow-lg shadow-[#FFD700]/10"
                    : "bg-[#1C1C24] text-white rounded-bl-none border border-white/5"
                }`}
              >
                {msg.type === "audio" ? (
                  <div className="flex items-center gap-3 py-1">
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? "bg-black/20 text-black" : "bg-[#FFD700] text-black"}`}>
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <div className="space-y-1">
                      <div className={`h-1.5 w-28 rounded-full ${isMe ? "bg-black/30" : "bg-white/20"}`} />
                      <span className="text-[10px] opacity-70">0:12</span>
                    </div>
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.text}</p>
                )}
                <span className={`block text-[9px] mt-1 text-right ${isMe ? "text-black/60" : "text-white/40"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 bg-[#121218] border-t border-white/10 sticky bottom-0 z-20">
        {isRecording ? (
          <div className="flex items-center justify-between bg-[#1C1C24] px-4 py-3 rounded-full border border-red-500/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-400">Gravando áudio... 0:{audioTimer < 10 ? `0${audioTimer}` : audioTimer}</span>
            </div>
            <button onClick={stopAudioRecord} className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-4 py-1.5 rounded-full text-xs font-bold">
              Enviar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGiftModal(true)} className="p-2.5 text-[#FFD700] hover:bg-white/5 rounded-full transition">
              <Gift className="w-5 h-5" />
            </button>
            <button onClick={startAudioRecord} className="p-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-[#121218] w-full max-w-lg rounded-t-3xl p-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
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
                  className="bg-[#1C1C24] hover:border-[#FFD700] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 transition"
                >
                  <span className="text-3xl">{g.icon}</span>
                  <span className="text-xs font-semibold text-white">{g.name}</span>
                  <span className="text-[10px] text-[#FFD700] font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {g.coins}
                  </span>
                </button>
              ))}
            </div>
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
    </div>
  );
}
  
