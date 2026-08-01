import { useNavigate } from "@tanstack/react-router";
import { Check, Coins, Crown, ShoppingCart, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { actions, useAppState } from "@/lib/hotmatch/store";

type Props = { open: boolean; onClose: () => void };

const VIP_PERKS = [
  "Acesso ilimitado ao Feed VIP",
  "Super Curtidas ilimitadas por dia",
  "Veja quem curtiu seu perfil",
  "Boost de visibilidade 3× mais alto",
  "Badge VIP exclusivo no perfil",
  "Descontos em pacotes de moedas",
];

export function VipModal({ open, onClose }: Props) {
  const { vip, coins } = useAppState();
  const navigate = useNavigate();

  function activate() {
    if (coins < 200) {
      toast.error("Saldo insuficiente. Recarregue moedas para ativar o VIP.");
      return;
    }
    actions.spendCoins(200);
    actions.activateVip();
    toast("VIP ativado! 👑", {
      description: "Você agora tem acesso a todos os benefícios exclusivos.",
      className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl",
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[22rem] overflow-hidden rounded-3xl border border-gold/30 bg-surface shadow-[0_0_40px_oklch(0.86_0.16_92/0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-gold/20 via-pink-500/10 to-transparent p-5 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-surface-2/80"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
          <Crown className="size-8 text-gold" fill="currentColor" />
          <h2 className="mt-2 text-xl font-extrabold text-gold">
            {vip ? "VIP Ativo 👑" : "Assinar VIP"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {vip
              ? "Você já tem acesso a todos os benefícios exclusivos."
              : "Desbloqueie acesso completo à plataforma."}
          </p>
        </div>

        <div className="space-y-4 p-5">
          {/* Coin balance */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins className="size-5 text-gold" />
              <div>
                <p className="text-[11px] text-muted-foreground">Saldo atual</p>
                <p className="text-base font-extrabold text-gold tabular-nums">{coins} moedas</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate({ to: "/loja" });
              }}
              className="tap-scale flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-foreground border border-border"
            >
              <ShoppingCart className="size-3.5" />
              Recarregar
            </button>
          </div>

          {/* Perks */}
          <div>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Benefícios incluídos
            </p>
            <ul className="space-y-2">
              {VIP_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm text-foreground/85">
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full ${vip ? "bg-emerald-500/20" : "bg-gold/15"}`}
                  >
                    <Check className={`size-3 ${vip ? "text-emerald-400" : "text-gold"}`} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {/* Price or active badge */}
          {vip ? (
            <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-bold text-emerald-400">
              <Check className="size-4" />
              Assinatura ativa
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end justify-between rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">Custo de ativação</p>
                  <p className="text-2xl font-extrabold text-gold">200 moedas</p>
                </div>
                <span className="rounded-full bg-primary/20 px-2 py-1 text-[10px] font-bold text-primary">
                  Mensal
                </span>
              </div>
              <button
                onClick={activate}
                className="tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold"
              >
                <Zap className="size-4" />
                Ativar VIP agora
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              navigate({ to: "/loja" });
            }}
            className="tap-scale w-full rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground"
          >
            Ver pacotes de moedas na loja
          </button>
        </div>
      </div>
    </div>
  );
}
