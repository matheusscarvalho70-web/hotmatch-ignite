import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useAppState, r as supabase, t as actions } from "./store-ClKvk3xj.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { G as Check, L as Crown, M as Heart, O as Lock, R as Coins, T as MessageCircle, _ as Send, c as Upload, d as Trash2, s as UserPlus, x as Plus } from "../_libs/lucide-react.mjs";
import { a as useUserLocation, t as haversineKm } from "./use-profiles-CEB_wMDR.mjs";
import { t as TopBar } from "./TopBar-CMUbpZHY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feed-BIuJsyGd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fetchPosts() {
	const { data, error } = await supabase.from("feed_posts").select("*, profiles!inner(*)").order("created_at", { ascending: false }).limit(40);
	return error || !data ? [] : data.map((r) => ({
		...r,
		author: r.profiles
	}));
}
function Feed() {
	const { gender, followed, profileId } = useAppState();
	const isCreator = gender === "female";
	const coords = useUserLocation(profileId ?? "");
	const tabs = isCreator ? [{
		id: "geral",
		label: "Feed Geral"
	}, {
		id: "meus",
		label: "Meus Posts"
	}] : [{
		id: "geral",
		label: "Feed Geral"
	}, {
		id: "following",
		label: "Seguindo"
	}];
	const [activeTab, setActiveTab] = (0, import_react.useState)("geral");
	const [postOpen, setPostOpen] = (0, import_react.useState)(false);
	const [likedIds, setLikedIds] = (0, import_react.useState)([]);
	const [allPosts, setAllPosts] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoading(true);
		fetchPosts().then((p) => {
			if (!cancelled) {
				setAllPosts(p);
				setLoading(false);
			}
		});
		const ch = supabase.channel("feed_live").on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "feed_posts"
		}, () => {
			if (!cancelled) fetchPosts().then((p) => !cancelled && setAllPosts(p));
		}).on("postgres_changes", {
			event: "DELETE",
			schema: "public",
			table: "feed_posts"
		}, (payload) => {
			if (!cancelled && payload.old?.id) setAllPosts((prev) => prev.filter((item) => item.id !== payload.old.id));
		}).subscribe();
		return () => {
			cancelled = true;
			supabase.removeChannel(ch);
		};
	}, []);
	const displayPosts = (0, import_react.useMemo)(() => {
		const base = activeTab === "following" ? allPosts.filter((p) => followed.includes(p.author_id)) : activeTab === "meus" ? allPosts.filter((p) => p.author_id === profileId) : allPosts;
		if (activeTab !== "geral" || !coords) return base;
		return [...base].sort((a, b) => {
			return (a.author?.latitude != null && a.author?.longitude != null ? haversineKm(coords.lat, coords.lng, a.author.latitude, a.author.longitude) : Infinity) - (b.author?.latitude != null && b.author?.longitude != null ? haversineKm(coords.lat, coords.lng, b.author.latitude, b.author.longitude) : Infinity);
		});
	}, [
		allPosts,
		activeTab,
		followed,
		profileId,
		coords
	]);
	const handleDelete = async (postId) => {
		if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;
		const { error } = await supabase.from("feed_posts").delete().eq("id", postId);
		if (error) toast.error("Erro ao excluir a publicação.");
		else {
			setAllPosts((prev) => prev.filter((p) => p.id !== postId));
			toast.success("Publicação excluída com sucesso!");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { title: "Feed Exclusivo" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-[3.5rem] z-30 mx-4 mb-4 flex rounded-full border border-border bg-surface p-1",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setActiveTab(t.id),
					className: `flex-1 rounded-full py-2 text-xs font-bold transition-all ${activeTab === t.id ? "bg-gradient-hot text-primary-foreground shadow-hot" : "text-muted-foreground"}`,
					children: t.label
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5 px-4",
				children: loading ? Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {}, i)) : displayPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyFeed, { tab: activeTab }) : displayPosts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
					post: p,
					activeTab,
					liked: likedIds.includes(p.id),
					onLike: () => setLikedIds((ids) => ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id]),
					onDelete: () => handleDelete(p.id)
				}, p.id))
			}),
			isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setPostOpen(true),
				className: "tap-scale fixed bottom-28 right-[max(1rem,calc(50%-14rem))] z-40 flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-3 shadow-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5 text-gold-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-bold text-gold-foreground",
					children: "Postar Mídia VIP"
				})]
			}),
			postOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostModal, {
				onClose: () => setPostOpen(false),
				profileId,
				onPosted: (p) => setAllPosts((prev) => [p, ...prev])
			})
		]
	});
}
function EmptyFeed({ tab }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-16 place-items-center rounded-full bg-surface-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-7 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: tab === "following" ? "Você ainda não segue nenhuma criadora" : tab === "meus" ? "Você ainda não publicou nada" : "Nenhum post disponível ainda"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-xs text-muted-foreground",
				children: tab === "following" ? "Siga criadoras no feed geral para ver os posts delas aqui." : tab === "meus" ? "Toque em Postar Mídia VIP para publicar seu primeiro conteúdo." : "Seja a primeira criadora a postar conteúdo exclusivo!"
			})
		]
	});
}
function PostSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-3xl border border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-11 rounded-full bg-surface-2 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-24 rounded-full bg-surface-2 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-16 rounded-full bg-surface-2 animate-pulse" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/5] bg-surface-2 animate-pulse" })]
	});
}
function PostCard({ post, activeTab, liked, onLike, onDelete }) {
	const { unlocked, followed, profileId } = useAppState();
	const isOwner = profileId === post.author_id;
	const isLocked = post.is_locked && !unlocked.includes(post.id) && (!isOwner || activeTab === "geral");
	const isFollowing = followed.includes(post.author_id);
	const relTime = (() => {
		const s = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 1e3);
		return s < 60 ? "agora" : s < 3600 ? `há ${Math.floor(s / 60)} min` : s < 86400 ? `há ${Math.floor(s / 3600)} h` : `há ${Math.floor(s / 86400)} d`;
	})();
	const isVideo = post.media_type === "video" || post.media_type === "vídeo";
	const toggleFollow = () => {
		if (isFollowing) {
			actions.unfollow(post.author_id);
			toast(`Deixou de seguir ${post.author.name}`);
			if (profileId) supabase.from("follows").delete().eq("follower_id", profileId).eq("following_id", post.author_id).then(() => {}).catch(() => {});
		} else {
			actions.follow(post.author_id);
			toast(`Seguindo ${post.author.name}`);
			if (profileId) supabase.from("follows").upsert({
				follower_id: profileId,
				following_id: post.author_id
			}, { onConflict: "follower_id,following_id" }).then(() => {}).catch(() => {});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "overflow-hidden rounded-3xl border border-border bg-surface shadow-card-premium",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/perfil",
						search: { uid: post.author_id },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ring-match grid size-11 shrink-0 place-items-center rounded-full p-[2px]",
							children: post.author.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: post.author.avatar_url,
								alt: post.author.name,
								width: 200,
								height: 200,
								loading: "lazy",
								className: "size-full rounded-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full rounded-full bg-surface-2" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/perfil",
							search: { uid: post.author_id },
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-bold",
								children: post.author.name
							}), post.author.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
								className: "size-3.5 shrink-0 text-gold",
								fill: "currentColor"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								relTime,
								" · ",
								post.media_type
							]
						})]
					}),
					isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onDelete,
						title: "Excluir",
						className: "tap-scale rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: toggleFollow,
						className: `tap-scale flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${isFollowing ? "border border-border bg-surface-2 text-foreground" : "bg-gradient-hot text-primary-foreground"}`,
						children: isFollowing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), "Seguindo"] }) : "Seguir"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[4/5] overflow-hidden bg-black",
				children: [isLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: post.media_url,
					alt: "Post",
					className: "size-full object-cover scale-110 blur-2xl brightness-50"
				}) : isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: post.media_url,
					controls: true,
					playsInline: true,
					className: "size-full object-contain"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: post.media_url,
					alt: "Post",
					className: "size-full object-cover"
				}), isLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-16 place-items-center rounded-full border border-gold/40 bg-black/50 shadow-gold backdrop-blur-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-7 text-gold" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-white",
							children: "Conteúdo VIP bloqueado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => isOwner ? toast.info("Este é o seu próprio post!") : actions.unlock(post.id, post.coin_price) ? toast("Mídia desbloqueada") : toast.error("Saldo insuficiente. Recarregue na Loja."),
							className: "tap-scale flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-3 shadow-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-gold-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-bold text-gold-foreground",
								children: [
									"Desbloquear por ",
									post.coin_price,
									" moedas"
								]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "space-y-2 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onLike,
							className: "tap-scale flex items-center gap-1.5 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
								className: `size-5 transition-colors ${liked ? "text-primary" : ""}`,
								fill: liked ? "currentColor" : "none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold tabular-nums",
								children: post.likes + (liked ? 1 : 0)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "tap-scale flex items-center gap-1.5 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Comentar"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "tap-scale ml-auto text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-5" })
						})
					]
				}), post.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: post.author.name
						}),
						" ",
						post.caption
					]
				})]
			})
		]
	});
}
function PostModal({ onClose, profileId, onPosted }) {
	const [price, setPrice] = (0, import_react.useState)(60);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	async function publish() {
		if (!profileId) return toast.error("Faça login primeiro.");
		if (!file) return toast.error("Selecione uma imagem ou vídeo.");
		setSaving(true);
		const path = `feed/${profileId}/${Date.now()}_${file.name}`;
		const { data: storageData, error: storageError } = await supabase.storage.from("photos").upload(path, file, {
			upsert: true,
			contentType: file.type
		});
		if (storageError || !storageData) {
			toast.error("Erro ao fazer upload da mídia.");
			setSaving(false);
			return;
		}
		const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(storageData.path);
		const mediaType = file.type.startsWith("video/") ? "video" : "foto";
		const { data, error } = await supabase.from("feed_posts").insert({
			author_id: profileId,
			caption: caption.trim() || null,
			media_url: publicUrl,
			media_type: mediaType,
			is_locked: price > 0,
			coin_price: price,
			likes: 0
		}).select("*, profiles!inner(*)").single();
		setSaving(false);
		if (error || !data) return toast.error(`Erro: ${error?.message || "Erro ao publicar"}`);
		const richPost = {
			...data,
			author: data.profiles
		};
		onPosted(richPost);
		onClose();
		toast("Mídia VIP publicada", { description: `Preço: ${price === 0 ? "Grátis" : `${price} moedas`}` });
		supabase.from("follows").select("follower_id, profiles!follower_id(onesignal_player_id)").eq("following_id", profileId).then(async ({ data: followers }) => {
			if (!followers || followers.length === 0) return;
			const notifs = followers.map((f) => ({
				user_id: f.follower_id,
				type: "feed",
				title: `Nova publicação de ${richPost.author?.name ?? "Criadora"}`,
				content: "Veja o novo conteúdo exclusivo no feed",
				is_read: false,
				actor_id: profileId
			}));
			await supabase.from("notifications").insert(notifs).catch(() => {});
			const pushTitle = `Nova publicação de ${richPost.author?.name ?? "Criadora"}`;
			const pushBody = "Veja o novo conteúdo exclusivo no feed";
			for (const f of followers) {
				const playerId = f.profiles?.onesignal_player_id;
				if (!playerId) continue;
				try {
					await supabase.functions.invoke("notify-user", { body: {
						player_id: playerId,
						title: pushTitle,
						message: pushBody
					} });
				} catch {}
			}
		}).catch(() => {});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-panel w-full max-w-[30rem] animate-in slide-in-from-bottom rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-4 h-1 w-10 rounded-full bg-border" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-extrabold",
					children: "Postar Mídia VIP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => inputRef.current?.click(),
					className: "mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-gold/5 px-4 py-8",
					children: preview ? file?.type.startsWith("video/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src: preview,
						className: "max-h-48 rounded-xl object-contain",
						controls: true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: preview,
						alt: "preview",
						className: "max-h-48 rounded-xl object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-6 text-gold" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold text-gold",
							children: "Selecionar imagem ou vídeo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "MP4, JPG ou PNG até 200 MB"
						})
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept: "image/*,video/*",
					className: "hidden",
					onChange: (e) => {
						const f = e.target.files?.[0];
						if (f) {
							setFile(f);
							setPreview(URL.createObjectURL(f));
						}
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-xs font-semibold text-muted-foreground",
					children: "Legenda"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: caption,
					onChange: (e) => setCaption(e.target.value),
					placeholder: "Escreva uma chamada irresistível...",
					className: "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-muted-foreground",
						children: "Preço de desbloqueio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold text-gold",
						children: price === 0 ? "Grátis" : `${price} moedas`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 300,
					step: 10,
					value: price,
					onChange: (e) => setPrice(Number(e.target.value)),
					className: "mt-2 w-full accent-[oklch(0.86_0.16_92)]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold",
						children: "Cancelar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: publish,
						disabled: saving || !file,
						className: "tap-scale flex-[1.4] rounded-full bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold disabled:opacity-50",
						children: saving ? "Publicando..." : "Publicar agora"
					})]
				})
			]
		})
	});
}
//#endregion
export { Feed as component };
