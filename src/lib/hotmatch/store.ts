import { useSyncExternalStore } from "react";

export type Role = "buyer" | "creator";
export type Gender = "male" | "female";

export type AppState = {
  profileId: string | null;
  gender: Gender;
  role: Role;
  name: string;
  avatarUrl: string | null;
  coins: number;
  earnings: number;
  xp: number;
  level: string;
  unlocked: string[];
  vip: boolean;
  followed: string[];
  galleryUnlocks: string[];
  unreadUsersCount: number; // Novo: Quantidade de usuários únicos com mensagens não lidas
};

const STORAGE_KEY = "hm_session_v3";

function loadFromStorage(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppState>) : {};
  } catch {
    return {};
  }
}

function persist(s: AppState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profileId: s.profileId,
        gender: s.gender,
        role: s.role,
        name: s.name,
        avatarUrl: s.avatarUrl,
        coins: s.coins,
        earnings: s.earnings,
        xp: s.xp,
        level: s.level,
        vip: s.vip,
      }),
    );
  } catch { /* quota */ }
}

const defaultState: AppState = {
  profileId: null,
  gender: "male",
  role: "buyer",
  name: "",
  avatarUrl: null,
  coins: 0,
  earnings: 0,
  xp: 0,
  level: "bronze",
  unlocked: [],
  vip: false,
  followed: [],
  galleryUnlocks: [],
  unreadUsersCount: 0,
};

const persisted = loadFromStorage();

let state: AppState = {
  ...defaultState,
  ...persisted,
  unlocked: [],
  followed: [],
  galleryUnlocks: [],
  unreadUsersCount: 0,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() { return state; }

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const actions = {
  setProfile(p: {
    profileId: string;
    gender: Gender;
    name: string;
    avatarUrl: string | null;
    coins: number;
    earnings: number;
    xp?: number;
    level?: string;
    vip?: boolean;
  }) {
    state = {
      ...state,
      profileId: p.profileId,
      gender: p.gender,
      role: p.gender === "female" ? "creator" : "buyer",
      name: p.name,
      avatarUrl: p.avatarUrl,
      coins: p.coins,
      earnings: p.earnings,
      xp: p.xp ?? state.xp,
      level: p.level ?? state.level,
      vip: p.vip ?? false,
    };
    persist(state);
    emit();
  },
  setGender(gender: Gender) {
    state = { ...state, gender, role: gender === "female" ? "creator" : "buyer" };
    persist(state);
    emit();
  },
  addCoins(amount: number) {
    state = { ...state, coins: state.coins + amount };
    persist(state);
    emit();
  },
  spendCoins(amount: number): boolean {
    if (state.coins < amount) return false;
    state = { ...state, coins: state.coins - amount };
    persist(state);
    emit();
    return true;
  },
  unlock(id: string, price: number): boolean {
    if (state.unlocked.includes(id)) return true;
    if (state.coins < price) return false;
    state = { ...state, coins: state.coins - price, unlocked: [...state.unlocked, id] };
    persist(state);
    emit();
    return true;
  },
  toggleRole() {
    state = { ...state, role: state.role === "buyer" ? "creator" : "buyer" };
    emit();
  },
  activateVip() {
    state = { ...state, vip: true };
    persist(state);
    emit();
  },
  withdraw(amount: number) {
    state = { ...state, earnings: Math.max(0, state.earnings - amount) };
    persist(state);
    emit();
  },
  follow(profileId: string) {
    if (state.followed.includes(profileId)) return;
    state = { ...state, followed: [...state.followed, profileId] };
    emit();
  },
  unfollow(profileId: string) {
    state = { ...state, followed: state.followed.filter((id) => id !== profileId) };
    emit();
  },
  unlockGallery(creatorId: string, price: number): boolean {
    if (state.galleryUnlocks.includes(creatorId)) return true;
    if (state.coins < price) return false;
    state = {
      ...state,
      coins: state.coins - price,
      galleryUnlocks: [...state.galleryUnlocks, creatorId],
    };
    persist(state);
    emit();
    return true;
  },
  setGalleryUnlocks(ids: string[]) {
    state = { ...state, galleryUnlocks: ids };
    emit();
  },
  setUnreadUsersCount(count: number) {
    if (state.unreadUsersCount === count) return;
    state = { ...state, unreadUsersCount: count };
    emit();
  },
  signOut() {
    state = { ...defaultState, unlocked: [], followed: [], galleryUnlocks: [], unreadUsersCount: 0 };
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    emit();
  },
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
