import { Link } from "@tanstack/react-router";
import { Flame, Coins } from "lucide-react";
import { useAppState } from "@/lib/hotmatch/store";

export function CoinBadge() {
  const { coins } = useAppState();
  return (
    <Link
      to="/loja"
      className="tap-scale flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5"
    >
      <Coins className="size-4 text-gold" />
      <span className="text-sm font-bold text-gold tabular-nums">{coins}</span>
    </Link>
  );
}

export function TopBar({ title, right }: { title?: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-gradient-to-b from-background via-background/90 to-transparent px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-hot shadow-hot">
          <Flame className="size-5 text-primary-foreground" fill="currentColor" />
        </span>
        <h1 className="truncate text-lg font-extrabold tracking-tight">
          {title ?? (
            <>
              Hot<span className="text-gradient-gold">Match</span>
            </>
          )}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">{right ?? <CoinBadge />}</div>
    </header>
  );
}
