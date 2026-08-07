import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Coins,
  Crown,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hotmatch/TopBar";
import { coinPacks } from "@/lib/hotmatch/data";
import { actions, formatBRL, useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja & Carteira VIP — HotMatch" },
      {
        name: "description",
        content:
          "Compre moedas HotMatch via Pix, assine o plano VIP Gold ou solicite o saque dos seus ganhos como criadora.",
      },
      { property: "og:title", content: "Loja & Carteira VIP — HotMatch" },
      {
        property: "og:description",
        content: "Pacotes de moedas, plano VIP Gold e saque Pix para criadoras.",
      },
    ],
  }),
  component: Store,
});

type LojaTab = "moedas" | "carteira";

function Store() {
  const { gender } = useAppState();
  const isCreator = gender === "female";
  const [activeTab, setActiveTab] = useState<LojaTab>("moedas");

  return (
    <div className="min-h-screen pb-32">
      <TopBar title={isCreator && activeTab === "carteira" ? "Carteira Criadora" : "Loja & VIP"} />

      {/* Se for criadora/mulher, exibe o seletor de abas no topo */}
      {isCreator && (
        <div className="sticky top-[3.5rem] z-30 mx-4 mb-4 flex rounded-full border border-border bg-surface p-1">
          <button
            onClick={() => setActiveTab("moedas")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-bold transition-all ${
              activeTab === "moedas"
                ? "bg-gradient-hot text-primary-foreground shadow-hot"
                : "text-muted-foreground"
            }`}
          >
            <Coins className="size-4" />
            Comprar Moedas
          </button>
          <button
            onClick={() => setActiveTab("carteira")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-bold transition-all ${
              activeTab === "carteira"
                ? "bg-gradient-hot text-primary-foreground shadow-hot"
                : "text-muted-foreground"
            }`}
          >
            <Wallet className="size-4" />
            Carteira Criadora
          </button>
        </div>
      )}

      <div className="px-4">
        {!isCreator || activeTab === "moedas" ? (
          <BuyerView isCreator={isCreator} />
        ) : (
          <CreatorView />
        )}
      </div>
    </div>
  );
}

function BuyerView({ isCreator }: { isCreator: boolean }) {
  const { coins, vip } = useAppState();
  const [checkout, setCheckout] = useState<(typeof coinPacks)[number] | null>(null);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-5 shadow-card-premium">
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-gold/15 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Seu saldo
        </p>
        <div className="mt-1 flex items-end gap-2">
          <Coins className="mb-1.5 size-7 text-gold" />
          <span className="text-4xl font-extrabold tabular-nums text-gradient-gold">{coins}</span>
          <span className="mb-1.5 text-sm font-medium text-muted-foreground">moedas</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Use para desbloquear mídias, enviar mimos e Super Likes.
        </p>
        {vip && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-gold">
            <Crown className="size-3.5" fill="currentColor" />
            VIP Gold ativo
          </div>
        )}
      </section>

      <h2 className="mb-3 mt-6 text-sm font-extrabold">Recarga rápida via Pix</h2>
      <div className="grid grid-cols-2 gap-3">
        {coinPacks.map((p) => (
          <button
            key={p.id}
            onClick={() => setCheckout(p)}
            className="tap-scale relative overflow-hidden rounded-3xl border border-border bg-surface p-4 text-left"
          >
            {p.tag && (
              <span className="absolute right-0 top-0 rounded-bl-xl bg-gradient-hot px-2 py-1 text-[9px] font-bold text-primary-foreground">
                {p.tag}
              </span>
            )}
            <Coins className="size-6 text-gold" />
            <p className="mt-2 text-xl font-extrabold tabular-nums">{p.coins}</p>
            <p className="text-[11px] font-medium text-muted-foreground">moedas</p>
            {p.bonus > 0 && (
              <p className="mt-1 text-[11px] font-bold text-gold">+{p.bonus} bônus VIP</p>
            )}
            <p className="mt-3 text-sm font-bold text-foreground">{formatBRL(p.price)}</p>
          </button>
        ))}
      </div>

      {/* O plano VIP Gold só renderiza se NÃO for criadora (apenas para homens) */}
      {!isCreator && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-surface to-surface-2 p-5">
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-gold" fill="currentColor" />
            <h2 className="text-base font-extrabold">
              Plano <span className="text-gradient-gold">HotMatch VIP Gold</span>
            </h2>
          </div>
          <ul className="mt-3 space-y-2">
            {[
              "Super Likes ilimitados todos os dias",
              "Veja quem curtiu seu perfil",
              "20% de desconto em todos os mimos",
              "Destaque dourado no Descobrir",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-foreground/85">
                <Check className="size-4 shrink-0 text-gold" />
                {b}
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              actions.activateVip();
              toast("Bem-vindo ao VIP Gold 👑");
            }}
            disabled={vip}
            className="tap-scale mt-4 w-full rounded-full bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold disabled:opacity-60"
          >
            {vip ? "VIP Gold ativo" : "Assinar por R$ 39,90/mês"}
          </button>
        </section>
      )}

      {checkout && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-[30rem] rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="text-lg font-extrabold">Pagamento via Pix</h2>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface-2 p-4">
              <div>
                <p className="text-sm font-bold">
                  {checkout.coins + checkout.bonus} moedas
                  {checkout.bonus > 0 && (
                    <span className="ml-1 text-xs font-semibold text-gold">
                      (+{checkout.bonus} bônus)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Crédito imediato após o pagamento</p>
              </div>
              <p className="text-lg font-extrabold text-gold">{formatBRL(checkout.price)}</p>
            </div>
            <div className="mt-4 grid place-items-center rounded-2xl border border-border bg-background p-6">
              <div className="grid size-32 grid-cols-8 gap-0.5 rounded-lg bg-foreground p-2">
                {Array.from({ length: 64 }).map((_, i) => (
                  <span
                    key={i}
                    className={(i * 7) % 3 === 0 ? "bg-background" : "bg-transparent"}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Escaneie o QR Code Pix</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setCheckout(null)}
                className="tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCheckout(null);
                  toast("Aguardando confirmação Pix ⏳", {
                    description: "As moedas serão creditadas automaticamente após a confirmação do pagamento.",
                  });
                }}
                className="tap-scale flex-[1.4] rounded-full bg-gradient-hot py-3 text-sm font-bold text-primary-foreground shadow-hot opacity-50 cursor-not-allowed"
                disabled
              >
                Aguardando Pix…
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CreatorView() {
  const { earnings, profileId } = useAppState();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [salesToday, setSalesToday] = useState(0);
  const [giftsTotal, setGiftsTotal] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const iso = todayStart.toISOString();
    supabase
      .from("feed_posts")
      .select("id", { count: "exact" })
      .eq("author_id", profileId)
      .gte("created_at", iso)
      .then(({ count }) => setSalesToday(count ?? 0));
    supabase
      .from("chat_messages")
      .select("id", { count: "exact" })
      .eq("receiver_id", profileId)
      .eq("message_kind", "gift")
      .then(({ count }) => setGiftsTotal(count ?? 0));
  }, [profileId]);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-5 shadow-card-premium">
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/20 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Saldo acumulado
        </p>
        <p className="mt-1 text-4xl font-extrabold text-gradient-gold">{formatBRL(earnings)}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <TrendingUp className="size-4" />
          Saldo acumulado de vendas e mimos
        </div>
        <button
          onClick={() => setOpen(true)}
          className="tap-scale mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold"
        >
          <ArrowDownToLine className="size-4" />
          Solicitar saque Pix
        </button>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon={<Zap className="size-4 text-primary" />} label="Posts hoje" value={String(salesToday)} />
        <Stat icon={<Sparkles className="size-4 text-gold" />} label="Mimos recebidos" value={String(giftsTotal)} />
      </div>

      <h2 className="mb-2 mt-6 text-sm font-extrabold">Transações recentes</h2>
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface py-8 text-center">
        <p className="text-sm font-semibold">Nenhuma transação ainda</p>
        <p className="text-xs text-muted-foreground">Suas vendas e compras aparecerão aqui.</p>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-[30rem] rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="text-lg font-extrabold">Solicitar saque</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponível: <span className="font-bold text-gold">{formatBRL(earnings)}</span>
            </p>
            <label className="mt-4 block text-xs font-semibold text-muted-foreground">
              Chave Pix
            </label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="CPF, e-mail ou telefone"
              className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <label className="mt-3 block text-xs font-semibold text-muted-foreground">Valor</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
              inputMode="decimal"
              placeholder="R$ 0,00"
              className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const amount = Number(value.replace(/\./g, "").replace(",", "."));
                  if (!key || !amount) {
                    toast.error("Preencha a chave Pix e o valor");
                    return;
                  }
                  actions.withdraw(amount);
                  setOpen(false);
                  toast("Saque solicitado 💸", { description: "Cai na sua conta em até 24h." });
                }}
                className="tap-scale flex-[1.4] rounded-full bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold"
              >
                Confirmar saque
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      {icon}
      <p className="mt-2 text-xl font-extrabold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
