import { useEffect, useState } from "react";
import { supabase, type DbMatch } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

export function useMatches() {
  const { profileId } = useAppState();
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    let cancelled = false;

    supabase
      .from("matches")
      .select("*")
      .eq("user_id", profileId)
      .eq("action", "like")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setMatches(data as DbMatch[]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profileId]);

  return { matches, loading };
}

async function sendPushNotification(playerId: string, title: string, message: string) {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/notify-user`;
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY as string}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ player_id: playerId, title, message }),
    });
  } catch {
    // Push opcional
  }
}

export async function recordMatch(
  userId: string,
  targetUserId: string,
  action: "like" | "pass",
): Promise<{ error: string | null; mutualMatch: boolean }> {

  // 1. Grava no feed/matches
  const { error: swipeError } = await supabase.from("matches").upsert(
    { user_id: userId, target_user_id: targetUserId, action },
    { onConflict: "user_id,target_user_id" },
  );

  if (swipeError) {
    console.error("Erro ao gravar em matches:", swipeError.message);
  }

  if (action !== "like") return { error: null, mutualMatch: false };

  // 2. Grava na tabela de likes
  const { error: likeError } = await supabase.from("likes").upsert(
    { user_id: userId, target_user_id: targetUserId },
    { onConflict: "user_id,target_user_id" },
  );

  if (likeError) {
    console.error("Erro ao gravar em likes:", likeError.message);
    // Tenta fallback com insert simples caso upsert dê conflito de chave
    if (likeError.message.includes("duplicate") || likeError.code === "23505") {
      // Like já existia, segue em frente
    } else {
      return { error: likeError.message, mutualMatch: false };
    }
  }

  // 3. Checa se o outro usuario ja deu like de volta
  const { data: reverseLikes } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("target_user_id", userId);

  const reverseLike = reverseLikes && reverseLikes.length > 0 ? reverseLikes[0] : null;

  // Notificação de like individual
  supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
    .then(({ data: actor }) => {
      supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "like",
        title: actor?.name ? `${actor.name} curtiu você! 🔥` : "Alguém curtiu você! 🔥",
        content: "Toque para ver quem te curtiu",
        is_read: false,
        actor_id: userId,
        actor_avatar_url: actor?.avatar_url ?? null,
      }).then(() => {});
    })
    .catch(() => {});

  if (!reverseLike) return { error: null, mutualMatch: false };

  // 4. DEU MATCH MÚTUO! Grava na tabela mutual_matches
  const [u1, u2] = [userId, targetUserId].sort();
  const { error: matchError } = await supabase.from("mutual_matches").insert({
    user_1: u1,
    user_2: u2,
  });

  if (matchError && !matchError.message.includes("duplicate") && matchError.code !== "23505") {
    console.error("Erro ao gravar match mútuo:", matchError);
  }

  // 5. Notifica ambos
  supabase
    .from("profiles")
    .select("id, name, onesignal_player_id")
    .in("id", [userId, targetUserId])
    .then(({ data: profs }) => {
      const me = profs?.find((p) => p.id === userId);
      const them = profs?.find((p) => p.id === targetUserId);

      const meContent = them?.name
        ? `Você e ${them.name} se curtiram! Comece a conversar agora.`
        : "Vocês se curtiram! Comece a conversar agora.";
      const themContent = me?.name
        ? `Você e ${me.name} se curtiram! Comece a conversar agora.`
        : "Vocês se curtiram! Comece a conversar agora.";

      supabase.from("notifications").insert([
        { user_id: userId, type: "match", title: "Deu Match! 🔥", content: meContent, is_read: false },
        { user_id: targetUserId, type: "match", title: "Deu Match! 🔥", content: themContent, is_read: false },
      ]).then(() => {});

      if ((me as any)?.onesignal_player_id) {
        sendPushNotification((me as any).onesignal_player_id, "Deu Match! 🔥", meContent);
      }
      if ((them as any)?.onesignal_player_id) {
        sendPushNotification((them as any).onesignal_player_id, "Deu Match! 🔥", themContent);
      }
    })
    .catch(() => {});

  return { error: null, mutualMatch: true };
}

/**
 * Busca a lista de matches buscando nas colunas user_1 e user_2
 */
export async function fetchMutualMatchIds(profileId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("mutual_matches")
    .select("user_1, user_2")
    .or(`user_1.eq.${profileId},user_2.eq.${profileId}`);

  if (!data) return new Set();
  return new Set(
    data.map((r) => (r.user_1 === profileId ? r.user_2 : r.user_1)),
  );
}
