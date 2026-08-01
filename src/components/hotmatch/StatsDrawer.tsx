import { BarChart2, Eye, Heart, Star, TrendingUp, Users, X } from "lucide-react";
import { useAppState } from "@/lib/hotmatch/store";

type Props = { open: boolean; onClose: () => void };

const WEEKLY = [40, 65, 52, 80, 73, 95, 88];
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function StatsDrawer({ open, onClose }: Props) {
  const { gender, followed } = useAppState();
  const isCreator = gender === "female";

  const stats = isCreator
    ? [
        { icon: Eye, label: "Visualizações", value: "12.4k", sub: "+18% esta semana", color: "text-foreground" },
        { icon: Heart, label: "Curtidas", value: "3.208", sub: "+7% esta semana", color: "text-primary" },
        { icon: Star, label: "Mimos recebidos", value: "472", sub: "+23% esta semana", color: "text-gold" },
        { icon: Users, label: "Seguidores", value: "1.840", sub: "+34 novos hoje", color: "text-cyan-400" },
      ]
    : [
        { icon: Heart, label: "Curtidas enviadas", value: "1.042", sub: "Total acumulado", color: "text-primary" },
        { icon: Users, label: "Criadores seguindo", value: String(followed.length), sub: "Perfis salvos", color: "text-gold" },
        { icon: Eye, label: "Perfis visitados", value: "318", sub: "Últimos 30 dias", color: "text-foreground" },
        { icon: BarChart2, label: "Taxa de resposta", value: "64%", sub: "Mensagens enviadas", color: "text-cyan-400" },
      ];

  const maxVal = Math.max(...WEEKLY);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background"
        style={{ maxHeight: "88dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="size-5 text-primary" />
            <h2 className="text-lg font-extrabold">Estatísticas do Perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-surface-2"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-10">
          {/* Period badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              Últimos 7 dias
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="size-3.5" />
              Em alta
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
                <s.icon className={`size-5 ${s.color}`} />
                <p className={`mt-2 text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-xs font-medium text-foreground/80">{s.label}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Weekly bar chart */}
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {isCreator ? "Visualizações por dia" : "Interações por dia"}
            </p>
            <div className="flex items-end justify-between gap-1.5" style={{ height: 72 }}>
              {WEEKLY.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-hot opacity-80"
                    style={{ height: `${Math.round((v / maxVal) * 64)}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement rate */}
          <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gold">Taxa de engajamento</p>
              <span className="text-xl font-extrabold text-gold">
                {isCreator ? "26,8%" : "14,2%"}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                style={{ width: isCreator ? "27%" : "14%" }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {isCreator
                ? "Acima da média da plataforma (18%)"
                : "Próximo da média da plataforma (16%)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
