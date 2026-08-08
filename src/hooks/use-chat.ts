import { useEffect, useRef, useState } from "react";
import { supabase, type DbChatMessage } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export type LocalMessage = {
  id: string;
  from: "me" | "them";
  kind: "text" | "audio" | "locked" | "gift";
  text?: string;
  media?: string;
  seconds?: number;
  price?: number;
  time: string;
};

function toLocal(msg: DbChatMessage, myId: string): LocalMessage {
  const from = msg.sender_id === myId ? "me" : "them";
  const time = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const kind = (msg.message_kind ?? "text") as LocalMessage["kind"];

  return {
    id: msg.id,
    from,
    kind,
    text: msg.content ?? undefined,
    media: msg.media_url ?? undefined,
    seconds: msg.audio_seconds ?? undefined,
    price: msg.unlock_price && msg.unlock_price > 0 ? msg.unlock_price : undefined,
    time,
  };
}

export type UseChatOptions = {
  partnerId: string;
  partnerName?: string;
  isDemo?: boolean;
};

export function useChat({ partnerId, partnerName, isDemo }: UseChatOptions) {
  const { profileId } = useAppState();
  const myId = profileId ?? "";
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!myId || !partnerId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .or(
            `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`,
          )
          .order("created_at", { ascending: true })
          .limit(100);

        if (!cancelled) {
          if (!error && data) setMessages(data.map((m) => toLocal(m as DbChatMessage, myId)));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`chat_${[myId, partnerId].sort().join("_")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const msg = payload.new as DbChatMessage;
          const relevant =
            (msg.sender_id === myId && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === myId);
          if (relevant && !cancelled) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, toLocal(msg, myId)];
            });
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [myId, partnerId]);

  async function sendMessage(text: string, kind: "text" | "gift" | "audio" = "text"): Promise<void> {
    if (!myId || !text.trim()) return;
    try {
      if (kind === "gift") {
        await supabase.from("chat_messages").insert({
          sender_id: myId,
          receiver_id: partnerId,
          content: text,
          message_kind: "gift",
        });
      } else if (kind === "audio") {
        await supabase.from("chat_messages").insert({
          sender_id: myId,
          receiver_id: partnerId,
          content: text,
          message_kind: "audio",
        });
      } else {
        await supabase.from("chat_messages").insert({
          sender_id: myId,
          receiver_id: partnerId,
          content: text,
          message_kind: "text",
        });
      }
      notifyPartner(partnerId, "Nova mensagem!", text);
    } catch (err) {
      console.error("[Chat] sendMessage error:", err);
    }
  }

  async function sendAudioMessage(mediaUrl: string, seconds: number): Promise<void> {
    if (!myId) return;
    try {
      const { error } = await supabase.from("chat_messages").insert({
        sender_id: myId,
        receiver_id: partnerId,
        media_url: mediaUrl,
        audio_seconds: seconds,
        message_kind: "audio",
        content: `Áudio (${seconds}s)`,
      });
      if (error) console.error("[Chat] sendAudioMessage Supabase error:", error);
      notifyPartner(partnerId, "🎤 Áudio recebido", "Novo áudio para você");
    } catch (err) {
      console.error("[Chat] sendAudioMessage exception:", err);
    }
  }

  async function sendGiftMessage(emoji: string, name: string, price: number): Promise<void> {
    if (!myId) return;
    await supabase.from("chat_messages").insert({
      sender_id: myId,
      receiver_id: partnerId,
      content: `${emoji} ${name}`,
      message_kind: "gift",
      unlock_price: price,
    });
    notifyPartner(partnerId, `${emoji} Mimo recebido`, `Você ganhou: ${name}`);
  }

  return { messages, loading, sendMessage, sendAudioMessage, sendGiftMessage, myId, partnerName, isDemo };
}

/** Best-effort: look up partner's OneSignal player ID and call notify-user edge function */
async function notifyPartner(receiverId: string, title: string, body: string) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("onesignal_player_id")
      .eq("id", receiverId)
      .maybeSingle();
    if (!data?.onesignal_player_id) return;
    await supabase.functions.invoke("notify-user", {
      body: { player_id: data.onesignal_player_id, title, message: body },
    });
  } catch (e) {
    console.warn("[Push] notifyPartner failed:", e);
  }
}
