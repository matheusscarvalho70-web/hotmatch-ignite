import { useEffect, useRef, useState } from "react";
import { supabase, type DbChatMessage } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export type LocalMessage = {
  id: string;
  from: "me" | "them";
  kind: "text" | "audio" | "locked" | "gift";
  text?: string;
  seconds?: number;
  price?: number;
  media?: string;
  time: string;
};

function toLocal(msg: DbChatMessage, myId: string): LocalMessage {
  return {
    id: msg.id,
    from: msg.sender_id === myId ? "me" : "them",
    kind: msg.message_kind,
    text: msg.content ?? undefined,
    seconds: msg.audio_seconds ?? undefined,
    price: msg.unlock_price > 0 ? msg.unlock_price : undefined,
    media: msg.media_url ?? undefined,
    time: new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function useChat(partnerId: string) {
  const { profileId } = useAppState();
  const myId = profileId ?? "";
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!myId || !partnerId) { setMessages([]); setLoading(false); return; }
    let cancelled = false;
    setMessages([]);
    setLoading(true);

    supabase
      .from("chat_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),` +
        `and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`,
      )
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data, error }) => {
        if (!cancelled) {
          if (!error && data) setMessages((data as DbChatMessage[]).map((m) => toLocal(m, myId)));
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(`chat:${[myId, partnerId].sort().join("-")}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as DbChatMessage;
          const rel = (msg.sender_id === myId && msg.receiver_id === partnerId) ||
                      (msg.sender_id === partnerId && msg.receiver_id === myId);
          if (rel && !cancelled) setMessages((p) => [...p, toLocal(msg, myId)]);
        })
      .subscribe();

    channelRef.current = channel;
    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [myId, partnerId]);

  async function sendText(text: string) {
    if (!myId) return { error: new Error("Not logged in") };
    const { error } = await supabase.from("chat_messages").insert({
      sender_id: myId, receiver_id: partnerId,
      content: text, message_kind: "text",
    });
    return { error };
  }

  async function sendAudio(seconds: number) {
    if (!myId) return;
    await supabase.from("chat_messages").insert({
      sender_id: myId, receiver_id: partnerId,
      message_kind: "audio", audio_seconds: seconds,
    });
  }

  async function sendGift(emoji: string, name: string, price: number) {
    if (!myId) return;
    await supabase.from("chat_messages").insert({
      sender_id: myId, receiver_id: partnerId,
      content: `${emoji} ${name}`, message_kind: "gift", unlock_price: price,
    });
  }

  return { messages, loading, sendText, sendAudio, sendGift, myId };
}
