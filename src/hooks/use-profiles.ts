import { useEffect, useState } from "react";
import { supabase, type DbProfile, type DbUserPhoto } from "@/lib/supabase";

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
    if (!id) return;
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
    if (!userId) return;
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
