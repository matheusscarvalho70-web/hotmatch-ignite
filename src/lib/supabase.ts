import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbProfile = {
  id: string;
  gender: "male" | "female";
  name: string;
  age: number;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  xp: number;
  level: string;
  coin_balance: number;
  earnings_brl: number;
  is_verified: boolean;
  is_demo: boolean;
  onesignal_player_id: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type DbUserPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  is_vip: boolean;
  coin_price: number;
  sort_order: number;
  created_at: string;
};

export type DbNotification = {
  id: string;
  user_id: string;
  type: "message" | "match" | "like";
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
};

export type DbChatMessage = {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  content: string | null;
  media_url: string | null;
  is_locked: boolean;
  unlock_price: number;
  message_kind: "text" | "audio" | "locked" | "gift";
  audio_seconds: number | null;
  created_at: string;
};

export type DbReport = {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  subject: string;
  description: string | null;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
};

export type DbFeedPost = {
  id: string;
  author_id: string;
  caption: string | null;
  media_url: string;
  media_type: "foto" | "vídeo";
  is_locked: boolean;
  coin_price: number;
  likes: number;
  created_at: string;
  profiles?: DbProfile;
};

export type DbMatch = {
  id: string;
  user_id: string;
  target_user_id: string;
  action: "like" | "pass";
  created_at: string;
};

export type DbLike = {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
};

export type DbMutualMatch = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export type DbTransaction = {
  id: string;
  user_id: string;
  /** BRL monetary value (purchases, withdrawals). Zero for coin-only operations. */
  amount: number;
  /** Coin delta — positive for credits, negative for debits. */
  coins_amount: number;
  type: "purchase" | "gift_sent" | "gift_received" | "unlock" | "withdrawal" | string;
  created_at: string;
};
