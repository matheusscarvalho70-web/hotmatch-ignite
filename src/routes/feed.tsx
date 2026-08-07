import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Coins, Crown, Heart, Lock, MessageCircle, Plus, Send, Trash2, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { haversineKm, useUserLocation } from "@/hooks/use-profiles";
import { TopBar } from "@/components/hotmatch/TopBar";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { supabase, type DbFeedPost, type DbProfile } from "@/lib/supabase";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed Exclusivo — HotMatch" },
      { name: "description", content: "Fotos e vídeos das criadoras HotMatch. Conteúdo público e mídias VIP." },
    ],
  }),
  component: Feed,
});

type FeedTab = "geral" | "following" | "meus";
type RichPost = DbFeedPost & { author: DbProfile };

async function fetchPosts(): Promise<RichPost[]> {
  const { data, error } = await supabase
    .from("feed_posts")
    .select("*, profiles!inner(*)")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error || !data) return [];
  return data.map((row) => ({ ...(row as DbFeedPost), author: (row as Record<string, unknown>).profiles as DbProfile }));
}

function Feed() {
  const { gender, followed, profileId } = useAppState();
  const isCreator = gender === "female";
  const coords = useUserLocation(profileId ?? "");

  const tabs: { id: FeedTab; label: string }[] = isCreator
    ? [{ id: "geral", label: "Feed Geral" }, { id: "meus", label: "Meus Posts" }]
    : [{ id: "geral", label: "Feed Geral" }, { id: "following", label: "Seguindo" }];

  const [activeTab, setActiveTab] = useState<FeedTab>("geral");
  const [postOpen, setPostOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [allPosts, setAllPosts] = useState<RichPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPosts().then((p) => { if (!cancelled) { setAllPosts(p); setLoading(false); } });

    const ch = supabase.channel("feed_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, () => {
        if (!cancelled) fetchPosts().then((p) => { if (!cancelled) setAllPosts(p); });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "feed_posts" }, (payload) => {
        if (!cancelled && payload.old?.id) {
          setAllPosts((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  const displayPosts = useMemo(() => {
    const base =
      activeTab === "following" ? allPosts.filter((p) => followed.includes(p.author_id))
      : activeTab === "meus"    ? allPosts.filter((p) => p.author_id === profileId)
      : allPosts;
    if (activeTab !== "geral" || !coords) return base;
    return [...base].sort((a, b) => {
      const da =
        a.author?.latitude != null && a.author?.longitude != null
          ? haversineKm(coords.lat, coords.lng, a.author.latitude, a.author.longitude)
          : Infinity;
      const db =
        b.author?.latitude != null && b.author?.longitude != null
          ? haversineKm(coords.lat, coords.lng, b.author.latitude, b.author.longitude)
          : Infinity;
      return da - db;
    });
  }, [allPosts, activeTab, followed, profileId, coords]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

    const { error } = await supabase.from("feed_posts").delete().eq("id", postId);
    if (error) {
      toast.error("Erro ao excluir a publicação.");
    } else {
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Publicação excluída com sucesso!");
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <TopBar title="Feed Exclusivo" />

      <div className="sticky top-[3.5rem] z-30 mx-4 mb-4 flex rounded-full border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${activeTab === t.id ? "bg-gradient-hot text-primary-foreground shadow-hot" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 px-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : displayPosts.length === 0 ? (
          <EmptyFeed tab={activeTab} />
        ) : (
          displayPosts.map((p) => (
            <PostCard key={p.id} post={p}
              activeTab={activeTab}
              liked={likedIds.includes(p.id)}
              onLike={() => setLikedIds((ids) => ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id])}
              onDelete={() => handleDeletePost(p.id)}
            />
          ))
        )}
      </div>

      {isCreator && (
        <button onClick={() => setPostOpen(true)}
          className="tap-scale fixed bottom-28 right-[max(1rem,calc(50%-14rem))] z-40 flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-3 shadow-gold">
          <Plus className="size-5 text-gold-foreground" />
          <span className="text-sm font-bold text-gold-foreground">Postar Mídia VIP</span>
        </button>
      )}

      {postOpen && (
        <PostModal
          onClose={() => setPostOpen(false)}
          profileId={profileId}
          onPosted={(p) => setAllPosts((prev) => [p, ...prev])}
        />
      )}
    </div>
  );
}

function EmptyFeed({ tab }: { tab: FeedTab }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-surface-2">
        <UserPlus className="size-7 text-muted-foreground" />
      </div>
      {tab === "following" ? (
        <>
          <p className="text-sm font-semibold">Você ainda não segue nenhuma criadora</p>
          <p className="max-w-xs text-xs text-muted-foreground">Siga criadoras no feed geral para ver os posts delas aqui.</p>
        </>
      ) : tab === "meus" ? (
        <>
          <p className="text-sm font-semibold">Você ainda não publicou nada</p>
          <p className="max-w-xs text-xs text-muted-foreground">Toque em Postar Mídia VIP para publicar seu primeiro conteúdo.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold">Nenhum post disponível ainda</p>
          <p className="max-w-xs text-xs text-muted-foreground">Seja a primeira criadora a postar conteúdo exclusivo!</p>
        </>
      )}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="flex items-center gap-3 p-3">
        <div className="size-11 rounded-full bg-surface-2 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded-full bg-surface-2 animate-pulse" />
          <div className="h-2 w-16 rounded-full bg-surface-2 animate-pulse" />
        </div>
      </div>
      <div className="aspect-[4/5] bg-surface-2 animate-pulse" />
    </div>
  );
}

function PostCard({ post, activeTab, liked, onLike, onDelete }: { post: RichPost; activeTab: FeedTab; liked: boolean; onLike: () => void; onDelete: () => void }) {
  const { unlocked, followed, profileId } = useAppState();
  const isOwner = profileId === post.author_id;
  
  const isLocked = post.is_locked && !unlocked.includes(post.id) && (!isOwner || activeTab === "geral");
  const isFollowing = followed.includes(post.author_id);

  const relTime = (() => {
    const s = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 1000);
    if (s < 60) return "agora";
    if (s < 3600) return `há ${Math.floor(s / 60)} min`;
    if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
    return `há ${Math.floor(s / 86400)} d`;
  })();

  const isVideo = post.media_type === "video" || post.media_type === "vídeo";

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card-premium">
      <header className="flex items-center gap-3 p-3">
        <Link to="/perfil" search={{ uid: post.author_id }}>
          <span className="ring-match grid size-11 shrink-0 place-items-center rounded-full p-[2px]">
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.name} width={200} height={200} loading="lazy" className="size-full rounded-full object-cover" />
            ) : <div className="size-full rounded-full bg-surface-2" />}
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <Link to="/perfil" search={{ uid: post.author_id }} className="flex items-center gap-1">
            <p className="truncate text-sm font-bold">{post.author.name}</p>
            {post.author.is_verified && <Crown className="size-3.5 shrink-0 text-gold" fill="currentColor" />}
          </Link>
          <p className="text-xs text-muted-foreground">{relTime} · {post.media_type}</p>
        </div>

        {isOwner ? (
          <button
            onClick={onDelete}
            title="Excluir publicação"
            className="tap-scale flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <Trash2 className="size-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (isFollowing) {
                actions.unfollow(post.author_id);
                toast(`Deixou de seguir ${post.author.name}`);
                if (profileId) supabase.from("follows").delete()
                  .eq("follower_id", profileId).eq("following_id", post.author_id)
                  .then(() => {}).catch(() => {});
              } else {
                actions.follow(post.author_id);
                toast(`Seguindo ${post.author.name} 💗`);
                if (profileId) supabase.from("follows").upsert(
                  { follower_id: profileId, following_id: post.author_id },
                  { onConflict: "follower_id,following_id" }
                ).then(() => {}).catch(() => {});
              }
            }}
            className={`tap-scale flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${isFollowing ? "border border-border bg-surface-2 text-foreground" : "bg-gradient-hot text-primary-foreground"}`}>
            {isFollowing ? <><Check className="size-3" />Seguindo</> : "Seguir"}
          </button>
        )}
      </header>

      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        {isLocked ? (
          <img
            src={post.media_url}
            alt={post.caption ?? "Post"}
            className="size-full object-cover scale-110 blur-2xl brightness-50"
          />
        ) : isVideo ? (
          <video
            src={post.media_url}
            controls
            playsInline
            className="size-full object-contain"
          />
        ) : (
          <img
            src={post.media_url}
            alt={post.caption ?? "Post"}
            className="size-full object-cover"
          />
        )}

        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full border border-gold/40 bg-black/50 shadow-gold backdrop-blur-md">
              <Lock className="size-7 text-gold" />
            </span>
            <p className="text-sm font-semibold text-white">Conteúdo VIP bloqueado</p>
            <button
              onClick={() => {
                if (isOwner) {
                  toast.info("Este é o seu próprio post!");
                  return;
                }
                if (actions.unlock(post.id, post.coin_price)) toast("Mídia desbloqueada 🔓"); else toast.error("Saldo insuficiente. Recarregue na Loja.");
              }}
              className="tap-scale flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-3 shadow-gold">
              <Coins className="size-4 text-gold-foreground" />
              <span className="text-sm font-bold text-gold-foreground">Desbloquear por {post.coin_price} moedas</span>
            </button>
          </div>
        )}
      </div>

      <footer className="space-y-2 p-3">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="tap-scale flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart className={`size-5 transition-colors ${liked ? "text-primary" : ""}`} fill={liked ? "currentColor" : "none"} />
            <span className="font-semibold tabular-nums">{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="tap-scale flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="size-5" /><span className="font-semibold">Comentar</span>
          </button>
          <button className="tap-scale ml-auto text-muted-foreground"><Send className="size-5" /></button>
        </div>
        {post.caption && (
          <p className="text-sm"><span className="font-bold">{post.author.name}</span> {post.caption}</p>
        )}
      </footer>
    </article>
  );
}

function PostModal({ onClose, profileId, onPosted }: {
  onClose: () => void; profileId: string | null; onPosted: (p: RichPost) => void;
}) {
  const [price, setPrice] = useState(60);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  inputRef = useRef<HTMLInputElement>(null);

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function publish() {
    if (!profileId) { toast.error("Faça login primeiro."); return; }
    if (!file) { toast.error("Selecione uma imagem ou vídeo antes de publicar."); return; }
    setSaving(true);

    const path = `feed/${profileId}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (storageError || !storageData) {
      toast.error("Erro ao fazer upload da mídia. Tente novamente.");
      setSaving(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(storageData.path);
    const mediaType = file.type.startsWith("video/") ? "video" : "foto";

    const { data, error } = await supabase
      .from("feed_posts")
      .insert({
        author_id: profileId,
        caption: caption.trim() || null,
        media_url: publicUrl,
        media_type: mediaType,
        is_locked: price > 0,
        coin_price: price,
        likes: 0,
      })
      .select("*, profiles!inner(*)")
      .single();

    setSaving(false);
    if (error || !data) {
      toast.error(`Erro Banco: ${error?.message || "Perfil não encontrado ao vincular post"}`);
      return;
    }
    
    const richPost: RichPost = { ...(data as DbFeedPost), author: (data as Record<string, unknown>).profiles as DbProfile };
    onPosted(richPost);
    onClose();
    toast("Mídia VIP publicada ✨", { description: `Preço: ${price === 0 ? "Grátis" : `${price} moedas`}` });

    const authorName = richPost.author?.name ?? "Criadora";
    supabase
      .from("follows")
      .select("follower_id, profiles!follower_id(onesignal_player_id)")
      .eq("following_id", profileId)
      .then(async ({ data: followers }) => {
        if (!followers || followers.length === 0) return;
        const notifs = followers.map((f) => ({
          user_id: f.follower_id,
          type: "feed" as const,
          title: `Nova publicação de ${authorName} 📸`,
          content: "Veja o novo conteúdo exclusivo no feed",
          is_read: false,
          actor_id: profileId,
        }));
        await supabase.from("notifications").insert(notifs).catch(() => {});
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        for (const f of followers) {
          const profile = (f as Record<string, unknown>).profiles as { onesignal_player_id?: string } | null;
          const playerId = profile?.onesignal_player_id;
          if (!playerId) continue;
          fetch(`${supabaseUrl}/functions/v1/notify-user`, {
            method: "POST",
            headers: { Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              player_id: playerId,
              title: `Nova publicação de ${authorName} 📸`,
              message: "Veja o novo conteúdo exclusivo no feed!",
            }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-[30rem] animate-in slide-in-from-bottom rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <h2 className="text-lg font-extrabold">Postar Mídia VIP</h2>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-gold/5 px-4 py-8"
        >
          {preview ? (
            file?.type.startsWith("video/") ? (
              <video src={preview} className="max-h-48 rounded-xl object-contain" controls />
            ) : (
              <img src={preview} alt="preview" className="max-h-48 rounded-xl object-contain" />
            )
          ) : (
            <>
              <Upload className="size-6 text-gold" />
              <span className="text-sm font-semibold text-gold">Selecionar imagem ou vídeo</span>
              <span className="text-xs text-muted-foreground">MP4, JPG ou PNG até 200 MB</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onFilePick}
        />
        <label className="mt-4 block text-xs font-semibold text-muted-foreground">Legenda</label>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Escreva uma chamada irresistível..."
          className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Preço de desbloqueio</span>
          <span className="text-sm font-bold text-gold">{price === 0 ? "Grátis" : `${price} moedas`}</span>
        </div>
        <input type="range" min={0} max={300} step={10} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-2 w-full accent-[oklch(0.86_0.16_92)]" />
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold">Cancelar</button>
          <button onClick={publish} disabled={saving || !file} className="tap-scale flex-[1.4] rounded-full bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold disabled:opacity-50">
    
