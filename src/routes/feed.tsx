import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Coins,
  Crown,
  Heart,
  Lock,
  MessageCircle,
  Play,
  Plus,
  Send,
  Upload,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hotmatch/TopBar";
import { posts, profiles, type Post } from "@/lib/hotmatch/data";
import { actions, useAppState } from "@/lib/hotmatch/store";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed Exclusivo — HotMatch" },
      {
        name: "description",
        content:
          "Fotos e vídeos das criadoras HotMatch. Conteúdo público e mídias VIP desbloqueáveis com moedas ou Pix.",
      },
      { property: "og:title", content: "Feed Exclusivo — HotMatch" },
      {
        property: "og:description",
        content: "Conteúdo exclusivo das criadoras, liberado com moedas HotMatch.",
      },
    ],
  }),
  component: Feed,
});

type FeedTab = "geral" | "following" | "meus";

function Feed() {
  const { gender, followed } = useAppState();
  const isCreator = gender === "female";

  const tabs: { id: FeedTab; label: string }[] = isCreator
    ? [
        { id: "geral", label: "Feed Geral" },
        { id: "meus", label: "Meus Posts" },
      ]
    : [
        { id: "geral", label: "Feed Geral" },
        { id: "following", label: "Criadoras que Sigo" },
      ];

  const [activeTab, setActiveTab] = useState<FeedTab>(tabs[0].id);
  const [postOpen, setPostOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const displayPosts = (() => {
    const allPosts = [...posts, ...posts.map((p) => ({ ...p, id: p.id + "-2" }))];
    if (activeTab === "following") {
      const followedPosts = allPosts.filter((p) => followed.includes(p.author.id));
      return followedPosts;
    }
    if (activeTab === "meus") {
      return allPosts.filter((p) => p.author.id === profiles[0].id);
    }
    return allPosts;
  })();

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Feed Exclusivo" />

      {/* Tab bar */}
      <div className="sticky top-[3.5rem] z-30 mx-4 mb-4 flex rounded-full border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
              activeTab === t.id
                ? "bg-gradient-hot text-primary-foreground shadow-hot"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 px-4">
        {displayPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-surface-2">
              <UserPlus className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">Você ainda não segue nenhuma criadora</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Siga suas criadoras favoritas no feed geral para ver os posts delas aqui.
            </p>
          </div>
        ) : (
          displayPosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              liked={likedIds.includes(p.id)}
              onLike={() =>
                setLikedIds((ids) =>
                  ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id],
                )
              }
            />
          ))
        )}
      </div>

      {isCreator && (
        <button
          onClick={() => setPostOpen(true)}
          className="tap-scale fixed bottom-28 right-[max(1rem,calc(50%-14rem))] z-40 flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-3 shadow-gold"
        >
          <Plus className="size-5 text-gold-foreground" />
          <span className="text-sm font-bold text-gold-foreground">Postar Mídia VIP</span>
        </button>
      )}

      {postOpen && <PostModal onClose={() => setPostOpen(false)} />}
    </div>
  );
}

function PostCard({
  post,
  liked,
  onLike,
}: {
  post: Post;
  liked: boolean;
  onLike: () => void;
}) {
  const { unlocked, followed } = useAppState();
  const isLocked = post.locked && !unlocked.includes(post.id);
  const isFollowing = followed.includes(post.author.id);

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card-premium">
      <header className="flex items-center gap-3 p-3">
        <span className="ring-match grid size-11 shrink-0 place-items-center rounded-full p-[2px]">
          <img
            src={post.author.photo}
            alt={post.author.name}
            width={768}
            height={1024}
            loading="lazy"
            className="size-full rounded-full object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-bold">{post.author.name}</p>
            {post.author.creator && (
              <Crown className="size-3.5 shrink-0 text-gold" fill="currentColor" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {post.time} · {post.type}
          </p>
        </div>
        <button
          onClick={() => {
            if (isFollowing) {
              actions.unfollow(post.author.id);
              toast(`Você deixou de seguir ${post.author.name}`);
            } else {
              actions.follow(post.author.id);
              toast(`Seguindo ${post.author.name} 💗`);
            }
          }}
          className={`tap-scale flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            isFollowing
              ? "border border-border bg-surface-2 text-foreground"
              : "bg-gradient-hot text-primary-foreground"
          }`}
        >
          {isFollowing ? (
            <>
              <Check className="size-3" />
              Seguindo
            </>
          ) : (
            "Seguir"
          )}
        </button>
      </header>

      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={post.media}
          alt={post.caption}
          width={768}
          height={1024}
          loading="lazy"
          className={`size-full object-cover transition-all duration-500 ${isLocked ? "scale-110 blur-2xl brightness-50" : ""}`}
        />
        {!isLocked && post.type === "vídeo" && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-black/50 backdrop-blur-md">
              <Play className="size-7 text-foreground" fill="currentColor" />
            </span>
          </span>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full border border-gold/40 bg-black/50 shadow-gold backdrop-blur-md">
              <Lock className="size-7 text-gold" />
            </span>
            <p className="text-sm font-semibold text-foreground/90">Conteúdo VIP bloqueado</p>
            <button
              onClick={() => {
                if (actions.unlock(post.id, post.price)) toast("Mídia desbloqueada 🔓");
                else toast.error("Saldo insuficiente", { description: "Recarregue na Loja VIP." });
              }}
              className="tap-scale flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-3 shadow-gold"
            >
              <Coins className="size-4 text-gold-foreground" />
              <span className="text-sm font-bold text-gold-foreground">
                Desbloquear por {post.price} moedas
              </span>
            </button>
            <button className="text-xs font-semibold text-muted-foreground underline underline-offset-4">
              ou pagar com Pix
            </button>
          </div>
        )}
      </div>

      <footer className="space-y-2 p-3">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="tap-scale flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart
              className={`size-5 transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}
              fill={liked ? "currentColor" : "none"}
            />
            <span className="font-semibold tabular-nums">{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="tap-scale flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="size-5" />
            <span className="font-semibold">Comentar</span>
          </button>
          <button className="tap-scale ml-auto text-muted-foreground">
            <Send className="size-5" />
          </button>
        </div>
        <p className="text-sm text-foreground/85">
          <span className="font-bold">{post.author.name}</span> {post.caption}
        </p>
      </footer>
    </article>
  );
}

function PostModal({ onClose }: { onClose: () => void }) {
  const [price, setPrice] = useState(60);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-[30rem] animate-in slide-in-from-bottom rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <h2 className="text-lg font-extrabold">Postar Mídia VIP</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie uma foto ou vídeo e defina o preço de desbloqueio.
        </p>

        <button className="mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-gold/5 px-4 py-8">
          <Upload className="size-6 text-gold" />
          <span className="text-sm font-semibold text-gold">Selecionar imagem ou vídeo</span>
          <span className="text-xs text-muted-foreground">MP4, JPG ou PNG até 200 MB</span>
        </button>

        <label className="mt-4 block text-xs font-semibold text-muted-foreground">Legenda</label>
        <input
          placeholder="Escreva uma chamada irresistível..."
          className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Preço de desbloqueio</span>
          <span className="text-sm font-bold text-gold">{price} moedas</span>
        </div>
        <input
          type="range"
          min={10}
          max={300}
          step={10}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-2 w-full accent-[oklch(0.86_0.16_92)]"
        />

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onClose();
              toast("Mídia VIP publicada ✨", { description: `Preço: ${price} moedas` });
            }}
            className="tap-scale flex-[1.4] rounded-full bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold"
          >
            Publicar agora
          </button>
        </div>
      </div>
    </div>
  );
}
