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

// Best-effort push via the notify-user edge function.
// Never throws — push is informational and must not block the match flow.
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
    // Intentionally swallowed — push is best-effort
  }
}

/**
 * Record a swipe decision and, for likes, run the full mutual-match flow:
 *
 * 1. Upsert into `matches`         — keeps the feed exclusion list up to date.
 * 2. Upsert into `likes`           — one-directional like ledger.
 * 3. Query `likes` for the reverse — did the target already like this user?
 * 4. Upsert into `mutual_matches`  — canonical ordered pair (user1_id < user2_id).
 * 5. Insert notifications for both users + fire OneSignal push to both.
 *
 * Steps 4–5 are the only ones that trigger on a mutual match.
 * Steps 1–3 run on every like.
 */
export async function recordMatch(
  userId: string,
  targetUserId: string,
  action: "like" | "pass",
): Promise<{ error: string | null; mutualMatch: boolean }> {

  // Always record the swipe so the feed excludes already-seen profiles.
  const { error: swipeError } = await supabase.from("matches").upsert(
    { user_id: userId, target_user_id: targetUserId, action },
    { onConflict: "user_id,target_user_id" },
  );
  if (swipeError) return { error: swipeError.message, mutualMatch: false };

  if (action !== "like") return { error: null, mutualMatch: false };

  // Step 2 — record the like in the dedicated likes table.
  const { error: likeError } = await supabase.from("likes").upsert(
    { user_id: userId, target_user_id: targetUserId },
    { onConflict: "user_id,target_user_id" },
  );
  if (likeError) return { error: likeError.message, mutualMatch: false };

  // Step 3 — check whether the target has already liked this user back.
  const { data: reverseLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("target_user_id", userId)
    .maybeSingle();

  // Notify the target about the one-directional like (fire-and-forget).
  // Fetch the actor's profile name + avatar so the notification can show the blurred photo.
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

  // Step 4 — mutual match confirmed.
  // Store a canonical ordered pair (user1_id always < user2_id lexicographically)
  // so there is exactly one row per couple regardless of who liked first.
  const [u1, u2] = [userId, targetUserId].sort();
  const { error: matchError } = await supabase.from("mutual_matches").upsert(
    { user1_id: u1, user2_id: u2 },
    { onConflict: "user1_id,user2_id" },
  );
  if (matchError) return { error: matchError.message, mutualMatch: false };

  // Step 5 — notifications + push for both users (best-effort, fire-and-forget).
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

      // Insert in-app notifications for both users
      supabase.from("notifications").insert([
        { user_id: userId, type: "match", title: "Deu Match! 🔥", content: meContent, is_read: false },
        { user_id: targetUserId, type: "match", title: "Deu Match! 🔥", content: themContent, is_read: false },
      ]).then(() => {});

      // Fire OneSignal push to each user who has a registered player ID
      if ((me as { onesignal_player_id?: string | null } | undefined)?.onesignal_player_id) {
        sendPushNotification(
          (me as { onesignal_player_id: string }).onesignal_player_id,
          "Deu Match! 🔥",
          meContent,
        );
      }
      if ((them as { onesignal_player_id?: string | null } | undefined)?.onesignal_player_id) {
        sendPushNotification(
          (them as { onesignal_player_id: string }).onesignal_player_id,
          "Deu Match! 🔥",
          themContent,
        );
      }
    })
    .catch(() => {});

  return { error: null, mutualMatch: true };
}

/**
 * Returns the partner IDs of all confirmed mutual matches for the given user.
 * Queries `mutual_matches` where the user appears as either user1_id or user2_id.
 */
export async function fetchMutualMatchIds(profileId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("mutual_matches")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`);

  if (!data) return new Set();
  return new Set(
    data.map((r) => (r.user1_id === profileId ? r.user2_id : r.user1_id)),
  );
}
