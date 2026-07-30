import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Ícone oficial HotMatch: duas linhas fluídas em gradiente (Ouro VIP + Rosa Neon)
 * que se cruzam formando um "H" minimalista com uma faísca central de conexão.
 */
export function HotMark({
  className,
  strokeWidth = 7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const gold = `hm-gold-${uid}`;
  const hot = `hm-hot-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={cn("size-6", className)}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#E5A93C" />
        </linearGradient>
        <linearGradient id={hot} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF2A5F" />
          <stop offset="100%" stopColor="#FF7A3C" />
        </linearGradient>
      </defs>

      {/* haste fluída esquerda -> cruza para a direita */}
      <path
        d="M19 10C14 24 24 40 19 54"
        stroke={`url(#${gold})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* haste fluída direita -> cruza para a esquerda */}
      <path
        d="M45 10c5 14-5 30 0 44"
        stroke={`url(#${hot})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* travessão do H */}
      <path
        d="M19 34h26"
        stroke={`url(#${gold})`}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* faísca central de conexão */}
      <path
        d="M32 22.5l3.2 6.3 6.3 3.2-6.3 3.2-3.2 6.3-3.2-6.3L22.5 32l6.3-3.2z"
        fill={`url(#${hot})`}
      />
      <circle cx="32" cy="32" r="2.4" fill="#FFD700" />
    </svg>
  );
}

export function HotMarkBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-2xl border border-gold/25 bg-surface-2/80 shadow-hot",
        className,
      )}
    >
      <HotMark className="size-5" />
    </span>
  );
}
