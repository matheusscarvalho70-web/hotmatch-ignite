import { useEffect, useState } from "react";
import { supabase, type DbProfile, type DbUserPhoto } from "@/lib/supabase";
import { actions, useAppState } from "@/lib/hotmatch/store";

export function useProfiles() {
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setProfiles(data as DbProfile[]);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { profiles, loading };
}

export function useProfile(id: string, refreshKey = 0) {
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled && !error) setProfile(data as DbProfile | null);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  return { profile, loading };
}

export function useUserPhotos(userId: string, refreshKey = 0) {
  const [publicPhotos, setPublicPhotos] = useState<DbUserPhoto[]>([]);
  const [vipPhotos, setVipPhotos] = useState<DbUserPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;
    supabase
      .from("user_photos")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          const photos = data as DbUserPhoto[];
          setPublicPhotos(photos.filter((p) => !p.is_vip));
          setVipPhotos(photos.filter((p) => p.is_vip));
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId, refreshKey]);

  return { publicPhotos, vipPhotos, loading };
}

async function hydrateFromDb(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return false;
  actions.setProfile({
    profileId: data.id,
    gender: data.gender as "male" | "female",
    name: data.name,
    avatarUrl: data.avatar_url,
    coins: data.coin_balance,
    earnings: Number(data.earnings_brl),
    xp: data.xp ?? 0,
    level: data.level ?? "bronze",
    vip: data.is_verified ?? false,
  });
  return true;
}

/**
 * On mount: checks the current Supabase Auth session and re-hydrates the store.
 * Listens to onAuthStateChange for sign-in/sign-out events throughout the session.
 */
export function useSessionBootstrap() {
  useEffect(() => {
    // 1. Sync store with the current auth session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        hydrateFromDb(session.user.id);
      }
    });

    // 2. React to future auth state changes
    // IMPORTANT: async work is wrapped in an IIFE to avoid the onAuthStateChange deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === "SIGNED_OUT") {
          actions.signOut();
        } else if (event === "SIGNED_IN" && session?.user) {
          await hydrateFromDb(session.user.id);
        }
      })();
    });

    return () => subscription.unsubscribe();
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export type ProfileStats = {
  postCount: number;
  likesTotal: number;
  giftsReceived: number;
  followersCount: number;
};

export function useProfileStats(profileId: string | null) {
  const [stats, setStats] = useState<ProfileStats>({ postCount: 0, likesTotal: 0, giftsReceived: 0, followersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    let cancelled = false;

    Promise.all([
      supabase.from("feed_posts").select("likes", { count: "exact" }).eq("author_id", profileId),
      supabase.from("chat_messages").select("id", { count: "exact" }).eq("receiver_id", profileId).eq("message_kind", "gift"),
    ]).then(([postsRes, giftsRes]) => {
      if (cancelled) return;
      const postCount = postsRes.count ?? 0;
      const likesTotal = (postsRes.data ?? []).reduce((s: number, p: { likes: number }) => s + (p.likes ?? 0), 0);
      const giftsReceived = giftsRes.count ?? 0;
      setStats({ postCount, likesTotal, giftsReceived, followersCount: 0 });
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [profileId]);

  return { stats, loading };
}
