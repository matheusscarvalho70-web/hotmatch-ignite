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

export function useProfile(id: string) {
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
  }, [id]);

  return { profile, loading };
}

export function useUserPhotos(userId: string) {
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
  }, [userId]);

  return { publicPhotos, vipPhotos, loading };
}

/** On mount: re-hydrates store from DB if a profileId is saved in localStorage. */
export function useSessionBootstrap() {
  const { profileId } = useAppState();

  useEffect(() => {
    if (!profileId) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) { actions.signOut(); return; }
        actions.setProfile({
          profileId: data.id,
          gender: data.gender as "male" | "female",
          name: data.name,
          avatarUrl: data.avatar_url,
          coins: data.coin_balance,
          earnings: Number(data.earnings_brl),
          xp: data.xp ?? 0,
          level: data.level ?? "bronze",
          vip: false,
        });
      });
  // intentionally run once on mount
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
