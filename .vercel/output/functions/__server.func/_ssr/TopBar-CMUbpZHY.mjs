import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as HotMark } from "./HotMark-OMbkMqZk.mjs";
import { i as useAppState, r as supabase, t as actions } from "./store-ClKvk3xj.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { K as CheckCheck, L as Crown, R as Coins, Y as Bell, i as X, r as Zap } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TopBar-CMUbpZHY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useNotifications() {
	const { profileId } = useAppState();
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function loadNotifications() {
			setLoading(true);
			const { data: { user } } = await supabase.auth.getUser();
			const authUserId = user?.id;
			let targetId = profileId;
			if (!targetId && authUserId) {
				const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", authUserId).maybeSingle();
				if (profile) targetId = profile.id;
			}
			const queryId = targetId || authUserId;
			if (!queryId) {
				setNotifications([]);
				setLoading(false);
				return;
			}
			const { data, error } = await supabase.from("notifications").select("*").eq("user_id", queryId).order("created_at", { ascending: false }).limit(30);
			if (!error && data) setNotifications(data);
			else setNotifications([]);
			setLoading(false);
		}
		loadNotifications();
	}, [profileId]);
	async function markAllRead() {
		const { data: { user } } = await supabase.auth.getUser();
		const authUserId = user?.id;
		const targetId = profileId || authUserId;
		if (!targetId) return;
		await supabase.from("notifications").update({ is_read: true }).eq("user_id", targetId).eq("is_read", false);
		setNotifications((prev) => prev.map((n) => ({
			...n,
			is_read: true
		})));
	}
	return {
		notifications,
		loading,
		unreadCount: notifications.filter((n) => {
			const type = n.type?.toLowerCase();
			return !n.is_read && type !== "message" && type !== "msg" && type !== "chat";
		}).length,
		markAllRead
	};
}
function CoinBadge() {
	const { coins } = useAppState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/loja",
		className: "tap-scale flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-bold text-gold tabular-nums",
			children: coins
		})]
	});
}
function CreatorBadge({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "tap-scale relative flex items-center gap-1.5 rounded-full px-3 py-1.5",
		style: {
			background: "linear-gradient(135deg, oklch(0.86 0.16 92 / 0.12), oklch(0.7 0.22 10 / 0.12))",
			boxShadow: "0 0 12px oklch(0.86 0.16 92 / 0.35), 0 0 4px oklch(0.7 0.22 10 / 0.2)",
			border: "1px solid oklch(0.86 0.16 92 / 0.45)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
			className: "size-3.5 text-gold",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-extrabold text-gold",
			children: "Nível Ouro"
		})]
	});
}
function GamificationModal({ onClose }) {
	const { xp, level, earnings, profileId } = useAppState();
	const [postCount, setPostCount] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!profileId) return;
		supabase.from("feed_posts").select("id", { count: "exact" }).eq("author_id", profileId).then(({ count }) => {
			if (count != null) setPostCount(count);
		});
	}, [profileId]);
	const LEVEL_XP = {
		bronze: 1e3,
		silver: 5e3,
		gold: 1e4,
		platinum: 25e3
	};
	const NEXT_LEVEL = {
		bronze: "Prata",
		silver: "Ouro",
		gold: "Platina",
		platinum: "Platina"
	};
	const nextXP = LEVEL_XP[level] ?? 1e3;
	const pct = Math.min(100, Math.round(xp / nextXP * 100));
	const levelLabel = {
		bronze: "Bronze",
		silver: "Prata",
		gold: "Ouro",
		platinum: "Platina"
	};
	const achievements = [
		{
			emoji: "📸",
			label: `${postCount} post${postCount !== 1 ? "s" : ""} publicado${postCount !== 1 ? "s" : ""}`,
			done: postCount > 0
		},
		{
			emoji: "💸",
			label: earnings > 0 ? `R$\u00a0${earnings.toFixed(2).replace(".", ",")} ganhos` : "Nenhum ganho ainda",
			done: earnings > 0
		},
		{
			emoji: "👑",
			label: `Nível ${NEXT_LEVEL[level] ?? "Platina"} (${nextXP.toLocaleString("pt-BR")} XP)`,
			done: false
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[22rem] overflow-hidden rounded-3xl border border-gold/30 bg-surface",
			style: { boxShadow: "0 0 40px oklch(0.86 0.16 92 / 0.2)" },
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative bg-gradient-to-br from-gold/20 via-pink-500/10 to-transparent p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-surface-2/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-12 place-items-center rounded-2xl bg-gold/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
								className: "size-7 text-gold",
								fill: "currentColor"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
							children: "Status da Criadora"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-extrabold text-gold",
							children: levelLabel[level] ?? level
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1.5 flex justify-between text-[11px] font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [xp.toLocaleString("pt-BR"), " XP"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-gold",
									children: [
										"próximo: ",
										nextXP.toLocaleString("pt-BR"),
										" XP"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 overflow-hidden rounded-full bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-gradient-to-r from-primary to-gold",
									style: { width: `${pct}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-right text-[10px] text-muted-foreground",
								children: [
									pct,
									"% para Nível ",
									NEXT_LEVEL[level] ?? "Platina"
								]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
						children: "Conquistas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: achievements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${a.done ? "border border-gold/20 bg-gold/8" : "border border-border bg-surface-2"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg",
									children: a.emoji
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `flex-1 font-medium ${a.done ? "text-foreground" : "text-muted-foreground"}`,
									children: a.label
								}),
								a.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4 shrink-0 text-gold" })
							]
						}, a.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/8 px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-primary",
							children: "Publique conteúdo VIP para ganhar XP e subir de nível"
						})]
					})
				]
			})]
		})
	});
}
var UNLOCK_COST = 15;
function LockedLikeRow({ n }) {
	const { vip, coins } = useAppState();
	const [unlocked, setUnlocked] = (0, import_react.useState)(false);
	function handleUnlock() {
		if (vip) {
			setUnlocked(true);
			return;
		}
		if (actions.spendCoins(UNLOCK_COST)) setUnlocked(true);
		else import("../_libs/sonner.mjs").then((n) => n.n).then(({ toast }) => toast.error(`Saldo insuficiente (${coins}/${UNLOCK_COST} moedas)`));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative shrink-0",
			children: n.actor_avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: n.actor_avatar_url,
				alt: "",
				className: `size-10 rounded-full object-cover transition-all duration-300 ${unlocked ? "" : "blur-md brightness-75"}`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 place-items-center rounded-full bg-surface-2 text-xl",
				children: unlocked ? "❤️" : "🔒"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0 flex-1",
			children: unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: n.title ?? "Nova curtida"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: n.content ?? ""
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Alguém te curtiu 🔥"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs text-muted-foreground",
					children: "Desbloqueie para ver quem foi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleUnlock,
					className: "flex items-center gap-1.5 rounded-full bg-gradient-hot px-3 py-1 text-[11px] font-bold text-white shadow-hot",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3" }), vip ? "Ver grátis (VIP)" : `Ver por ${UNLOCK_COST} moedas`]
				})
			] })
		})]
	});
}
function NotificationsDrawer({ onClose }) {
	const navigate = useNavigate();
	const { notifications, loading } = useNotifications();
	const { gender } = useAppState();
	const generalNotifs = (Array.isArray(notifications) ? notifications : []).filter((n) => {
		const type = n.type?.toLowerCase();
		return type !== "message" && type !== "msg" && type !== "chat";
	});
	const isMale = gender === "male";
	if (loading) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[55]",
		onClick: onClose
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 top-0 z-[56] mx-auto max-w-[30rem] overflow-y-auto rounded-b-3xl border-b border-x border-border bg-background shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
		style: {
			maxHeight: "80dvh",
			paddingTop: "calc(env(safe-area-inset-top) + 4rem)"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 p-4 pb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-extrabold",
					children: "Notificações"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "grid size-7 place-items-center rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
				})]
			}), generalNotifs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border/50",
				children: generalNotifs.map((n) => {
					const type = n.type?.toLowerCase();
					if (type === "like" && isMale) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockedLikeRow, { n }, n.id);
					let clickAction = () => {
						onClose();
						navigate({ to: "/mensagens" });
					};
					if (type === "match") {
						const targetUserId = n.actor_id || n.sender_id;
						if (targetUserId) clickAction = () => {
							onClose();
							navigate({
								to: "/mensagens/$userId",
								params: { userId: targetUserId }
							});
						};
					}
					const defaultEmoji = type === "match" ? "🔥" : type === "welcome" ? "🎉" : type === "feed" ? "📸" : "🔔";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: clickAction,
						className: "flex items-center gap-3.5 py-3.5 transition-colors hover:bg-surface-2/40 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative shrink-0",
							children: [n.actor_avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: n.actor_avatar_url,
								alt: "",
								className: "size-11 rounded-full object-cover border border-border"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 place-items-center rounded-full bg-surface-2 text-xl",
								children: defaultEmoji
							}), !n.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-bold text-foreground",
									children: n.title ?? "Notificação"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground shrink-0",
									children: new Date(n.created_at).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground mt-0.5",
								children: n.content ?? ""
							})]
						})]
					}, n.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-3 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-14 place-items-center rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-6 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Nenhuma notificação por enquanto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Suas curtidas, matches e avisos aparecerão aqui."
					})
				]
			})]
		})
	})] });
}
function NotificationBell() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { notifications, markAllRead } = useNotifications();
	const generalUnreadCount = (Array.isArray(notifications) ? notifications : []).filter((n) => {
		const type = n.type?.toLowerCase();
		return !n.is_read && type !== "message" && type !== "msg" && type !== "chat";
	}).length;
	function handleOpen() {
		setOpen((v) => !v);
		if (!open && generalUnreadCount > 0) markAllRead();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: handleOpen,
		className: "tap-scale relative grid size-9 place-items-center rounded-full border border-border bg-surface-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-foreground" }), generalUnreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-extrabold text-primary-foreground ring-2 ring-background",
			children: generalUnreadCount > 9 ? "9+" : generalUnreadCount
		})]
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsDrawer, { onClose: () => setOpen(false) })] });
}
function TopBar() {
	const { gender } = useAppState();
	const [showGamification, setShowGamification] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HotMark, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [gender === "male" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinBadge, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorBadge, { onClick: () => setShowGamification(true) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {})]
			}),
			showGamification && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GamificationModal, { onClose: () => setShowGamification(false) })
		]
	});
}
//#endregion
export { TopBar as t };
