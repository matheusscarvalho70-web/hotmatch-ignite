import { useEffect, useRef, useState } from "react";
import { supabase, type DbChatMessage } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";
import { toast } from "sonner";

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
  const storeMyId = profileId ?? "";
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [partnerUuid, setPartnerUuid] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // 1) Busca o usuário autenticado via supabase.auth.getUser() para usar
  //    user.id como sender_id — a política RLS exige sender_id = auth.uid().
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (error || !user) {
          console.error("[Chat] Usuário não autenticado:", error);
          return;
        }
        setAuthUserId(user.id);
      } catch (err) {
        console.error("[Chat] Falha ao obter usuário autenticado:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Define o partnerUuid de forma flexível para evitar travamentos
  useEffect(() => {
    if (!partnerId) {
      setPartnerUuid(null);
      return;
    }
    setPartnerUuid(partnerId);
  }, [partnerId]);

  // Usa o auth.uid() real; storeMyId serve apenas como fallback de exibição.
  const myId = authUserId ?? storeMyId;

  useEffect(() => {
    if (!myId || !partnerUuid) {
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
            `and(sender_id.eq.${myId},receiver_id.eq.${partnerUuid}),and(sender_id.eq.${partnerUuid},receiver_id.eq.${myId})`,
          )
          .order("created_at", { ascending: true })
          .limit(100);

        if (!cancelled) {
          if (!error && data)
            setMessages(data.map((m) => toLocal(m as DbChatMessage, myId)));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`chat_${[myId, partnerUuid].sort().join("_")}`)
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
            (msg.sender_id === myId && msg.receiver_id === partnerUuid) ||
            (msg.sender_id === partnerUuid && msg.receiver_id === myId);
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
  }, [myId, partnerUuid]);

  async function sendMessage(
    text: string,
    kind: "text" | "gift" | "audio" = "text",
  ): Promise<void> {
    if (!authUserId) {
      console.error(
        "[Chat] sendMessage cancelado: usuário não autenticado (authUserId vazio).",
      );
      toast.error("Você precisa estar logado para enviar mensagens.");
      return;
    }
    if (!partnerUuid) {
      console.error(
        "[Chat] sendMessage cancelado: partnerId não resolvido.",
      );
      toast.error("Destinatário inválido. Verifique o perfil do parceiro.");
      return;
    }
    try {
      const insertPayload = {
        sender_id: authUserId,
        receiver_id: partnerUuid,
        content: text,
        message_kind: kind,
      };
      const { data, error } = await supabase
        .from("chat_messages")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const local = toLocal(data as DbChatMessage, authUserId);
        setMessages((prev) => {
          if (prev.some((m) => m.id === local.id)) return prev;
          return [...prev, local];
        });
      }

      notifyPartner(partnerUuid, "Nova mensagem!", text);
    } catch (err) {
      console.error("Erro detalhado Supabase:", err);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  }

  async function sendAudioMessage(
    mediaUrl: string,
    seconds: number,
  ): Promise<void> {
    if (!authUserId) {
      console.error(
        "[Chat] sendAudioMessage cancelado: usuário não autenticado (authUserId vazio).",
      );
      toast.error("Você precisa estar logado para enviar mensagens.");
      return;
    }
    if (!partnerUuid) {
      console.error(
        "[Chat] sendAudioMessage cancelado: partnerId não resolvido.",
      );
      toast.error("Destinatário inválido. Verifique o perfil do parceiro.");
      return;
    }
    try {
      const insertPayload = {
        sender_id: authUserId,
        receiver_id: partnerUuid,
        media_url: mediaUrl,
        audio_seconds: seconds,
        message_kind: "audio" as const,
        content: `Áudio (${seconds}s)`,
      };
      const { data, error } = await supabase
        .from("chat_messages")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const local = toLocal(data as DbChatMessage, authUserId);
        setMessages((prev) => {
          if (prev.some((m) => m.id === local.id)) return prev;
          return [...prev, local];
        });
      }

      notifyPartner(partnerUuid, "🎤 Áudio recebido", "Novo áudio para você");
    } catch (err) {
      console.error("Erro detalhado Supabase:", err);
      toast.error("Erro ao enviar áudio. Tente novamente.");
    }
  }

  async function sendGiftMessage(
    emoji: string,
    name: string,
    price: number,
  ): Promise<void> {
    if (!authUserId) {
      console.error(
        "[Chat] sendGiftMessage cancelado: usuário não autenticado (authUserId vazio).",
      );
      toast.error("Você precisa estar logado para enviar mensagens.");
      return;
    }
    if (!partnerUuid) {
      console.error(
        "[Chat] sendGiftMessage cancelado: partnerId não resolvido.",
      );
      toast.error("Destinatário inválido. Verifique o perfil do parceiro.");
      return;
    }
    try {
      const insertPayload = {
        sender_id: authUserId,
        receiver_id: partnerUuid,
        content: `${emoji} ${name}`,
        message_kind: "gift" as const,
        unlock_price: price,
      };
      const { data, error } = await supabase
        .from("chat_messages")
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const local = toLocal(data as DbChatMessage, authUserId);
        setMessages((prev) => {
          if (prev.some((m) => m.id === local.id)) return prev;
          return [...prev, local];
        });
      }

      notifyPartner(partnerUuid, `${emoji} Mimo recebido`, `Você ganhou: ${name}`);
    } catch (err) {
      console.error("Erro detalhado Supabase:", err);
      toast.error("Erro ao enviar mimo. Tente novamente.");
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    sendAudioMessage,
    sendGiftMessage,
    myId,
    partnerName,
    isDemo,
  };
}

async function notifyPartner(
  receiverId: string,
  title: string,
  body: string,
) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("onesignal_player_id")
      .eq("id", receiverId)
      .maybeSingle();
    if (!data?.onesignal_player_id) return;
    await supabase.functions.invoke("notify-user", {
      body: {
        player_id: data.onesignal_player_id,
        title,
        message: body,
      },
    });
  } catch (e) {
    console.warn("[Push] notifyPartner failed:", e);
  }
}
