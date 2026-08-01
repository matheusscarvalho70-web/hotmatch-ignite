import { useSyncExternalStore } from "react";

export type Role = "buyer" | "creator";

export type Gender = "male" | "female";

export type AppState = {
  coins: number;
  gender: Gender;
  role: Role;
  earnings: number;
  unlocked: string[];
  vip: boolean;
  followed: string[];
};

let state: AppState = {
  coins: 320,
  gender: "male",
  role: "buyer",
  earnings: 2480.5,
  unlocked: [],
  vip: false,
  followed: [],
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const actions = {
  addCoins(amount: number) {
    state = { ...state, coins: state.coins + amount };
    emit();
  },
  spendCoins(amount: number): boolean {
    if (state.coins < amount) return false;
    state = { ...state, coins: state.coins - amount };
    emit();
    return true;
  },
  unlock(id: string, price: number): boolean {
    if (state.unlocked.includes(id)) return true;
    if (state.coins < price) return false;
    state = { ...state, coins: state.coins - price, unlocked: [...state.unlocked, id] };
    emit();
    return true;
  },
  setGender(gender: Gender) {
    state = { ...state, gender, role: gender === "female" ? "creator" : "buyer" };
    emit();
  },
  toggleRole() {
    state = { ...state, role: state.role === "buyer" ? "creator" : "buyer" };
    emit();
  },
  activateVip() {
    state = { ...state, vip: true };
    emit();
  },
  withdraw(amount: number) {
    state = { ...state, earnings: Math.max(0, state.earnings - amount) };
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
  signOut() {
    state = {
      coins: 320,
      gender: "male",
      role: "buyer",
      earnings: 2480.5,
      unlocked: [],
      vip: false,
      followed: [],
    };
    emit();
  },
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
