import { useState } from "react";
import { ArrowDownToLine, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";
import { actions, formatBRL, useAppState } from "@/lib/hotmatch/store";
import { salesHistory } from "@/lib/hotmatch/data";

type Props = { open: boolean; onClose: () => void };

export function EarningsDrawer({ open, onClose }: Props) {
  const { earnings } = useAppState();
  const [amount, setAmount] = useState("");
  const [pix, setPix] = useState("");
  const [loading, setLoading] = useState(false);

  function requestWithdraw() {
    const value = parseFloat(amount.replace(",", "."));
    if (!pix.trim()) {
      toast.error("Informe sua chave Pix.");
      return;
    }
    if (isNaN(value) || value < 50) {
      toast.error("Valor mínimo de saque é R$ 50,00.");
      return;
    }
    if (value > earnings) {
      toast.error("Saldo insuficiente para este saque.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      actions.withdraw(value);
      setLoading(false);
      setAmount("");
      toast("Saque solicitado! 💸", {
        description: `${formatBRL(value)} será transferido em até 2h via Pix.`,
        className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl",
      });
    }, 1500);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-extrabold">Dashboard de Ganhos</h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-surface-2"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-10">
          {/* Balance card */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-gold/20 via-pink-500/10 to-surface border border-gold/25 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Saldo disponível
            </p>
            <p className="mt-1 text-4xl font-extrabold text-gradient-gold tabular-nums">
              {formatBRL(earnings)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="size-3.5" />
              <span>+12% vs. semana passada</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Este mês", value: "R$\u00a0892", color: "text-foreground" },
              { label: "Mimos", value: "R$\u00a0340", color: "text-gold" },
              { label: "Mídias VIP", value: "R$\u00a0552", color: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-3 text-center">
                <p className={`text-base font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pix withdrawal form */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <p className="text-sm font-bold">Solicitar saque via Pix</p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Chave Pix (CPF, e-mail ou telefone)</label>
              <input
                type="text"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Valor (mín. R$ 50,00)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  R$
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={requestWithdraw}
              disabled={loading}
              className="tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3 text-sm font-extrabold text-gold-foreground shadow-gold disabled:opacity-60"
            >
              <ArrowDownToLine className="size-4" />
              {loading ? "Processando..." : "Solicitar saque"}
            </button>
          </div>

          {/* Transaction history */}
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Histórico de transações
            </p>
            <ul className="overflow-hidden rounded-2xl border border-border bg-surface divide-y divide-border">
              {salesHistory.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                    <span className="text-sm">💸</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{tx.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.who} · {tx.time}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-emerald-400">
                    +{formatBRL(tx.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
