import { useEffect, useMemo, useState } from "react";
import { supabase, type DbProfile, type DbUserPhoto } from "@/lib/supabase";
import { actions, useAppState } from "@/lib/hotmatch/store";

/** Haversine great-circle distance in km between two lat/lng points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Persist the browser-resolved coordinates back to the profiles row.
 * Called by useUserLocation; safe to call multiple times.
 */
export async function updateUserLocation(
  profileId: string,
  lat: number,
  lng: number,
): Promise<void> {
  if (!profileId) return;
  const { error } = await supabase
    .from("profiles")
    .update({ latitude: lat, longitude: lng })
    .eq("id", profileId);
  if (error) console.warn("[Location] DB update failed:", error.message);
}

// Module-level cache so multiple components sharing the hook don't trigger two
// permission prompts during the same page session.
let _cachedCoords: { lat: number; lng: number } | null = null;

/**
 * On mount, requests the browser's current position, saves it to the DB, and
 * returns it for use in distance-based sorting.
 * Triggers when the Discover or Feed tab is opened while the user is logged in.
 */
export function useUserLocation(profileId: string) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(_cachedCoords);

  useEffect(() => {
    if (!profileId) return;
    if (_cachedCoords) { setCoords(_cachedCoords); return; }
    if (!navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        _cachedCoords = { lat, lng };
        setCoords({ lat, lng });
        updateUserLocation(profileId, lat, lng).catch(() => {});
      },
      (err) => console.warn("[Location] Browser geolocation failed:", err.message),
      { timeout: 10_000, enableHighAccuracy: false },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  return coords;
}

/**
 * Fetches all profiles once, then sorts them by distance from the user when
 * coordinates are available. Profiles without coordinates sort to the end.
 */
export function useProfiles(userLat?: number, userLng?: number, excludeIds: string[] = []) {
  const [rawProfiles, setRawProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setRawProfiles(data as DbProfile[]);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const profiles = useMemo(() => {
    const filtered =
      excludeIds.length > 0
        ? rawProfiles.filter((p) => !excludeIds.includes(p.id))
        : rawProfiles;
    if (userLat == null || userLng == null) return filtered;
    return [...filtered].sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? haversineKm(userLat, userLng, a.latitude, a.longitude)
          : Infinity;
      const db =
        b.latitude != null && b.longitude != null
          ? haversineKm(userLat, userLng, b.latitude, b.longitude)
          : Infinity;
      return da - db;
    });
  }, [rawProfiles, userLat, userLng, excludeIds]);

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
  supabase
    .from("vip_gallery_unlocks")
    .select("creator_id")
    .eq("visitor_id", data.id)
    .then(({ data: unlocks }) => {
      if (unlocks) actions.setGalleryUnlocks(unlocks.map((r) => (r as { creator_id: string }).creator_id));
    });
  return true;
}

/**
 * On mount: checks the current Supabase Auth session and re-hydrates the store.
 * Listens to onAuthStateChange for sign-in/sign-out events throughout the session.
 */
export function useSessionBootstrap() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        hydrateFromDb(session.user.id);
      }
    });

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
    
