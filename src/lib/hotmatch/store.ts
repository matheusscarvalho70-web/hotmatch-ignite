import { useSyncExternalStore } from "react";

export type Role = "buyer" | "creator";

export type AppState = {
  coins: number;
  role: Role;
  earnings: number;
  unlocked: string[];
  vip: boolean;
};

let state: AppState = {
  coins: 320,
  role: "buyer",
  earnings: 2480.5,
  unlocked: [],
  vip: false,
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
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
