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

/**
 * Record a swipe decision and, for likes, run the mutual-match flow:
 *
 * 1. Upsert into `matches`         — keeps the feed exclusion list up to date.
 * 2. Upsert into `likes`           — one-directional like ledger.
 * 3. Query `likes` for the reverse — did the target already like this user?
 * 4. If yes: upsert into `mutual_matches` (canonical ordered pair) and return
 *    mutualMatch: true so the caller can show the match alert.
 *
 * UUIDs are sorted lexicographically before every mutual_matches write/read so
 * (A→B) and (B→A) always map to the same single row.
 */
export async function recordMatch(
  userId: string,
  targetUserId: string,
  action: "like" | "pass",
): Promise<{ error: string | null; mutualMatch: boolean }> {

  // Always record the swipe in the legacy matches table so the feed keeps
  // excluding already-seen profiles.
  const { error: swipeError } = await supabase.from("matches").upsert(
    { user_id: userId, target_user_id: targetUserId, action },
    { onConflict: "user_id,target_user_id" },
  );
  if (swipeError) return { error: swipeError.message, mutualMatch: false };

  // Passes do not need mutual-match processing.
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

  if (!reverseLike) return { error: null, mutualMatch: false };

  // Step 4 — mutual match confirmed. Write a canonical ordered pair so there
  // is exactly one row per couple regardless of who liked first.
  const [u1, u2] = [userId, targetUserId].sort();
  const { error: matchError } = await supabase.from("mutual_matches").upsert(
    { user1_id: u1, user2_id: u2 },
    { onConflict: "user1_id,user2_id" },
  );
  if (matchError) return { error: matchError.message, mutualMatch: false };

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
