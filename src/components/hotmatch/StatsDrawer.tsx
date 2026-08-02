import { BarChart2, Eye, Heart, Star, TrendingUp, Users, X } from "lucide-react";
import { useAppState } from "@/lib/hotmatch/store";
import { useProfileStats } from "@/hooks/use-profiles";

type Props = { open: boolean; onClose: () => void };

export function StatsDrawer({ open, onClose }: Props) {
  const { gender, followed, profileId } = useAppState();
  const isCreator = gender === "female";
  const { stats, loading } = useProfileStats(profileId);

  const creatorStats = [
    { icon: Eye, label: "Visualizações", value: "0", sub: "Em breve", color: "text-foreground" },
    { icon: Heart, label: "Curtidas", value: stats.likesTotal.toLocaleString("pt-BR"), sub: "Total acumulado", color: "text-primary" },
    { icon: Star, label: "Mimos recebidos", value: stats.giftsReceived.toLocaleString("pt-BR"), sub: "Total acumulado", color: "text-gold" },
    { icon: Users, label: "Posts publicados", value: stats.postCount.toLocaleString("pt-BR"), sub: "Feed VIP", color: "text-cyan-400" },
  ];

  const maleStats = [
    { icon: Heart, label: "Curtidas enviadas", value: stats.likesTotal.toLocaleString("pt-BR"), sub: "Total acumulado", color: "text-primary" },
    { icon: Users, label: "Criadoras que sigo", value: String(followed.length), sub: "Perfis salvos", color: "text-gold" },
    { icon: Eye, label: "Perfis visitados", value: "0", sub: "Em breve", color: "text-foreground" },
    { icon: BarChart2, label: "Posts desbloqueados", value: "0", sub: "Mídias VIP", color: "text-cyan-400" },
  ];

  const displayStats = isCreator ? creatorStats : maleStats;

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
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              Acumulado
            </span>
            {!loading && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="size-3.5" />
                Dados reais
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {displayStats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
                  <s.icon className={`size-5 ${s.color}`} />
                  <p className={`mt-2 text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-medium text-foreground/80">{s.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gold">Taxa de engajamento</p>
              <span className="text-xl font-extrabold text-gold">
                {stats.postCount > 0 && stats.likesTotal > 0
                  ? `${Math.min(100, Math.round((stats.likesTotal / (stats.postCount * 100)) * 100))}%`
                  : "0%"}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all"
                style={{
                  width: stats.postCount > 0 && stats.likesTotal > 0
                    ? `${Math.min(100, Math.round((stats.likesTotal / (stats.postCount * 100)) * 100))}%`
                    : "0%",
                }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {stats.postCount === 0
                ? "Publique conteúdo VIP para calcular seu engajamento"
                : "Com base em curtidas por post"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
