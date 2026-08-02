import { useEffect, useState } from "react";
import { supabase, type DbTransaction } from "@/lib/supabase";
import { useAppState } from "@/lib/hotmatch/store";

/**
 * Returns the transaction history of the logged-in user (most recent first, capped at 50).
 */
export function useTransactions() {
  const { profileId } = useAppState();
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    let cancelled = false;

    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setTransactions(data as DbTransaction[]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profileId]);

  return { transactions, loading };
}

/**
 * Persist a single transaction row.
 *
 * @param userId      Supabase profile ID of the acting user.
 * @param type        Transaction category (e.g. 'purchase', 'gift_sent', 'unlock', 'withdrawal').
 * @param coinsAmount Coin delta — positive for credits, negative for debits.
 * @param amount      BRL monetary value (zero for coin-only operations).
 */
export async function recordTransaction(
  userId: string,
  type: DbTransaction["type"],
  coinsAmount: number,
  amount = 0,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type,
    coins_amount: coinsAmount,
    amount,
  });
  return { error: error?.message ?? null };
}
