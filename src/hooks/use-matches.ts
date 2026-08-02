import { useEffect, useState } from "react";
import { supabase, type DbMatch } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

/**
 * Returns all "like" decisions made by the logged-in user.
 * Automatically excludes "pass" records so only real matches are surfaced.
 */
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
 * Record a swipe decision (like / pass).
 *
 * Uses upsert so a second swipe on the same target updates the existing row
 * instead of throwing a unique-constraint error.
 *
 * Returns `mutualMatch: true` when both users have liked each other.
 */
export async function recordMatch(
  userId: string,
  targetUserId: string,
  action: "like" | "pass",
): Promise<{ error: string | null; mutualMatch: boolean }> {
  const { error } = await supabase.from("matches").upsert(
    { user_id: userId, target_user_id: targetUserId, action },
    { onConflict: "user_id,target_user_id" },
  );

  if (error) return { error: error.message, mutualMatch: false };
  if (action !== "like") return { error: null, mutualMatch: false };

  // Detect mutual match: check whether the other user already liked this user
  const { data } = await supabase
    .from("matches")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("target_user_id", userId)
    .eq("action", "like")
    .maybeSingle();

  return { error: null, mutualMatch: !!data };
}
