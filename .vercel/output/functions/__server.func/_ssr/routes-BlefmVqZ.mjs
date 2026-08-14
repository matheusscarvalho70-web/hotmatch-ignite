import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useAppState, r as supabase } from "./store-ClKvk3xj.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { E as MapPin, L as Crown, M as Heart, Z as BadgeCheck, b as RotateCcw, f as Star, i as X, p as Sparkles } from "../_libs/lucide-react.mjs";
import { a as useUserLocation, i as useProfiles, t as haversineKm } from "./use-profiles-CEB_wMDR.mjs";
import { t as TopBar } from "./TopBar-CMUbpZHY.mjs";
import { t as confetti_module_default } from "../_libs/canvas-confetti.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BlefmVqZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function sendPushNotification(playerId, title, message) {
	try {
		await fetch(`https://ugktawqajqbasqsvtaxl.supabase.co/functions/v1/notify-user`, {
			method: "POST",
			headers: {
				Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3Rhd3FhanFiYXNxc3Z0YXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg4NjcsImV4cCI6MjEwMTYxNDg2N30.TMGs1v-Yg6qXJ3CiUzc6ngyCeZB98apYoNyOfNzurqw`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				player_id: playerId,
				title,
				message
			})
		});
	} catch {}
}
async function recordMatch(userId, targetUserId, action) {
	const { error: swipeError } = await supabase.from("matches").upsert({
		user_id: userId,
		target_user_id: targetUserId,
		action
	}, { onConflict: "user_id,target_user_id" });
	if (swipeError) {
		console.error("Erro ao gravar histórico em matches:", swipeError.message);
		return {
			error: swipeError.message,
			mutualMatch: false
		};
	}
	if (action !== "like") return {
		error: null,
		mutualMatch: false
	};
	supabase.from("profiles").select("name, avatar_url").eq("id", userId).maybeSingle().then(({ data: actor }) => {
		supabase.from("notifications").insert({
			user_id: targetUserId,
			type: "like",
			title: actor?.name ? `${actor.name} curtiu você! 🔥` : "Alguém curtiu você! 🔥",
			content: "Toque para ver quem te curtiu",
			is_read: false,
			actor_id: userId,
			actor_avatar_url: actor?.avatar_url ?? null
		}).then(() => {});
		supabase.from("profiles").select("onesignal_player_id").eq("id", targetUserId).maybeSingle().then(({ data: targetProf }) => {
			if (targetProf?.onesignal_player_id) sendPushNotification(targetProf.onesignal_player_id, actor?.name ? `${actor.name} curtiu você! 🔥` : "Nova curtida! 🔥", "Toque para ver no HotMatch");
		});
	}).catch(() => {});
	const [u1, u2] = [userId, targetUserId].sort();
	const { data: matchData } = await supabase.from("mutual_matches").select("id").eq("user_1", u1).eq("user_2", u2).maybeSingle();
	if (!matchData) return {
		error: null,
		mutualMatch: false
	};
	supabase.from("profiles").select("id, name, onesignal_player_id").in("id", [userId, targetUserId]).then(({ data: profs }) => {
		const me = profs?.find((p) => p.id === userId);
		const them = profs?.find((p) => p.id === targetUserId);
		const meContent = them?.name ? `Você e ${them.name} se curtiram! Comece a conversar agora.` : "Vocês se curtiram! Comece a conversar agora.";
		const themContent = me?.name ? `Você e ${me.name} se curtiram! Comece a conversar agora.` : "Vocês se curtiram! Comece a conversar agora.";
		supabase.from("notifications").insert([{
			user_id: userId,
			type: "match",
			title: "Deu Match! 🔥",
			content: meContent,
			is_read: false
		}, {
			user_id: targetUserId,
			type: "match",
			title: "Deu Match! 🔥",
			content: themContent,
			is_read: false
		}]).then(() => {});
		if (me?.onesignal_player_id) sendPushNotification(me.onesignal_player_id, "Deu Match! 🔥", meContent);
		if (them?.onesignal_player_id) sendPushNotification(them.onesignal_player_id, "Deu Match! 🔥", themContent);
	}).catch(() => {});
	return {
		error: null,
		mutualMatch: true
	};
}
function Discover() {
	const { profileId, gender, avatarUrl, name: myName } = useAppState();
	const navigate = useNavigate();
	const coords = useUserLocation(profileId ?? "");
	const [swipedIds, setSwipedIds] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!profileId) return;
		let cancelled = false;
		supabase.from("matches").select("target_user_id").eq("user_id", profileId).then(({ data }) => {
			if (!cancelled && data) setSwipedIds(data.map((r) => r.target_user_id));
		});
		return () => {
			cancelled = true;
		};
	}, [profileId]);
	const { profiles, loading } = useProfiles(coords?.lat, coords?.lng, swipedIds);
	const deck = (0, import_react.useMemo)(() => {
		if (!profiles.length) return [];
		return profiles.filter((p) => p.id !== profileId);
	}, [profiles, profileId]);
	const [lockedCard, setLockedCard] = (0, import_react.useState)(null);
	const [matchedProfile, setMatchedProfile] = (0, import_react.useState)(null);
	const [drag, setDrag] = (0, import_react.useState)({
		x: 0,
		y: 0,
		active: false
	});
	const [leaving, setLeaving] = (0, import_react.useState)(null);
	const start = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	(0, import_react.useEffect)(() => {
		if (!profileId) navigate({
			to: "/bem-vindo",
			replace: true
		});
	}, [profileId, navigate]);
	const current = lockedCard ?? deck[0] ?? null;
	const next = lockedCard ? deck[0] ?? null : deck[1] ?? null;
	async function decide(dir) {
		const target = lockedCard ?? deck[0];
		let activeUserId = profileId;
		if (!activeUserId) {
			const { data: sessionData } = await supabase.auth.getSession();
			activeUserId = sessionData.session?.user?.id ?? null;
		}
		if (!activeUserId) {
			const { data: userData } = await supabase.auth.getUser();
			activeUserId = userData.user?.id ?? null;
		}
		if (!target) {
			toast.error("Nenhum perfil ativo para curtir!");
			return;
		}
		if (!activeUserId) {
			toast.error("Usuário não identificado! Faça login novamente.");
			console.error("Erro: activeUserId indisponível", {
				profileId,
				target
			});
			return;
		}
		const action = dir === "left" ? "pass" : "like";
		setLockedCard(target);
		setSwipedIds((prev) => [...prev, target.id]);
		setLeaving(dir);
		try {
			const res = await recordMatch(activeUserId, target.id, action);
			if (res.error) {
				toast.error(`Erro ao salvar ação: ${res.error}`);
				console.error("Erro no recordMatch:", res.error);
			}
			if (res.mutualMatch) {
				console.log("🔥 MATCH CONFIRMADO! Exibindo tela de Match...");
				setMatchedProfile(target);
			}
		} catch (err) {
			console.error("Exceção ao registrar match:", err);
		}
		if (dir === "right") toast("Curtida enviada 💗", { description: `Você curtiu ${target.name}` });
		if (dir === "up") toast("Super Like ⭐", { description: `${target.name} vai ver seu Super Like primeiro` });
		setTimeout(() => {
			setLeaving(null);
			setDrag({
				x: 0,
				y: 0,
				active: false
			});
			setLockedCard(null);
		}, 260);
	}
	const rotate = drag.x / 18;
	const transform = leaving ? leaving === "up" ? "translate3d(0,-120%,0) scale(0.9)" : `translate3d(${leaving === "right" ? 120 : -120}%,0,0) rotate(${leaving === "right" ? 18 : -18}deg)` : `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotate}deg)`;
	if (!profileId) return null;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-4 mt-4 h-[68vh] min-h-[26rem] animate-pulse rounded-[2rem] bg-surface-2" })]
	});
	if (!current) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center px-6 pt-24 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-20 place-items-center rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-9 text-muted-foreground" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-lg font-extrabold",
					children: "Nenhum perfil por enquanto"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xs text-sm text-muted-foreground",
					children: "Novos perfis aparecerão aqui em breve. Volte mais tarde ou convide amigos!"
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
			matchedProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchModal, {
				partner: matchedProfile,
				myAvatar: avatarUrl,
				myName,
				onClose: () => setMatchedProfile(null),
				onMessage: () => {
					setMatchedProfile(null);
					navigate({
						to: "/mensagens/$chatId",
						params: { chatId: matchedProfile.id }
					});
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-4 h-[68vh] min-h-[26rem] select-none",
				children: [next && next.id !== current.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardShell, {
					profile: next,
					className: "scale-[0.94] opacity-60"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 touch-none",
					style: {
						transform,
						transition: drag.active ? "none" : "transform 260ms cubic-bezier(.2,.8,.2,1)"
					},
					onPointerDown: (e) => {
						e.target.setPointerCapture?.(e.pointerId);
						start.current = {
							x: e.clientX,
							y: e.clientY
						};
						setDrag({
							x: 0,
							y: 0,
							active: true
						});
					},
					onPointerMove: (e) => {
						if (!drag.active) return;
						setDrag({
							x: e.clientX - start.current.x,
							y: e.clientY - start.current.y,
							active: true
						});
					},
					onPointerUp: () => {
						if (!drag.active) return;
						if (drag.y < -110 && Math.abs(drag.x) < 90) decide("up");
						else if (drag.x > 110) decide("right");
						else if (drag.x < -110) decide("left");
						else setDrag({
							x: 0,
							y: 0,
							active: false
						});
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardShell, {
						profile: current,
						stamp: drag.x,
						stampUp: drag.y,
						userLat: coords?.lat,
						userLng: coords?.lng
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center justify-center gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "tap-scale grid size-12 place-items-center rounded-full border border-border bg-surface text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => decide("left"),
						className: "tap-scale grid size-16 place-items-center rounded-full border border-border bg-surface text-foreground shadow-card-premium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => decide("up"),
						className: "tap-scale grid size-14 place-items-center rounded-full bg-gradient-gold shadow-gold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
							className: "size-6 text-gold-foreground",
							fill: "currentColor"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => decide("right"),
						className: "tap-scale grid size-16 place-items-center rounded-full bg-gradient-hot shadow-hot",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							className: "size-7 text-primary-foreground",
							fill: "currentColor"
						})
					})
				]
			})
		]
	});
}
function MatchModal({ partner, myAvatar, myName, onClose, onMessage }) {
	(0, import_react.useEffect)(() => {
		const colors = [
			"#ff3c5a",
			"#ff8c00",
			"#ffd700",
			"#ff69b4",
			"#ffffff"
		];
		const end = Date.now() + 2400;
		(function frame() {
			confetti_module_default({
				particleCount: 6,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors,
				disableForReducedMotion: true
			});
			confetti_module_default({
				particleCount: 6,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors,
				disableForReducedMotion: true
			});
			if (Date.now() < end) requestAnimationFrame(frame);
		})();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-xs rounded-3xl bg-surface p-8 text-center shadow-[0_0_60px_rgba(255,60,90,0.3)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl font-black tracking-tight text-primary",
					children: "Deu Match! 🔥"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Vocês se curtiram!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-6 flex items-center justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							url: myAvatar,
							label: myName,
							size: "lg"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -right-5 top-1/2 z-10 -translate-y-1/2 text-2xl",
							children: "💗"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							url: partner.avatar_url,
							label: partner.name,
							size: "lg",
							ring: true
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-bold",
					children: partner.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onMessage,
					className: "tap-scale mt-6 w-full rounded-full bg-gradient-hot py-3 text-sm font-extrabold text-primary-foreground shadow-hot",
					children: "Enviar mensagem"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "tap-scale mt-3 w-full rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold text-muted-foreground",
					children: "Continuar curtindo"
				})
			]
		})
	});
}
function Avatar({ url, label, size, ring }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `size-20 overflow-hidden rounded-full ${ring ? "ring-4 ring-primary" : "ring-2 ring-background"} bg-surface-2`,
		children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: label,
			className: "size-full object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-full bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center text-2xl font-extrabold text-foreground/40",
			children: label.charAt(0).toUpperCase()
		})
	});
}
function CardShell({ profile, className = "", stamp = 0, stampUp = 0, userLat, userLng }) {
	const locationText = (0, import_react.useMemo)(() => {
		if (userLat == null || userLng == null || profile.latitude == null || profile.longitude == null) return null;
		const km = haversineKm(userLat, userLng, profile.latitude, profile.longitude);
		if (km < 1) return "A menos de 1 km de você";
		return `A ${Math.round(km)} km de você`;
	}, [
		userLat,
		userLng,
		profile.latitude,
		profile.longitude
	]) ?? profile.location;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `absolute inset-0 overflow-hidden rounded-[2rem] bg-surface shadow-card-premium ${className}`,
		children: [
			profile.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: profile.avatar_url,
				alt: `Foto de ${profile.name}`,
				width: 768,
				height: 1024,
				className: "size-full object-cover",
				draggable: false
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full bg-gradient-to-br from-surface-2 to-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" }),
			profile.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/50 px-2.5 py-1 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
					className: "size-3.5 text-gold",
					fill: "currentColor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-semibold text-gold",
					children: "Verificada"
				})]
			}),
			locationText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-foreground/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-medium text-foreground/90",
					children: locationText
				})]
			}),
			stamp > 40 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stamp, {
				label: "LIKE",
				tone: "hot",
				style: { opacity: Math.min(1, stamp / 120) },
				left: true
			}),
			stamp < -40 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stamp, {
				label: "NOPE",
				tone: "mute",
				style: { opacity: Math.min(1, -stamp / 120) }
			}),
			stampUp < -60 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stamp, {
				label: "SUPER",
				tone: "gold",
				style: { opacity: Math.min(1, -stampUp / 120) },
				center: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-extrabold tracking-tight",
							children: profile.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pb-0.5 text-xl font-light text-foreground/80",
							children: profile.age
						}),
						profile.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
							className: "mb-0.5 size-5 text-gold",
							fill: "currentColor"
						})
					]
				}), profile.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 line-clamp-2 text-sm text-foreground/75",
					children: profile.bio
				})]
			})
		]
	});
}
function Stamp({ label, tone, style, left, center }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		style,
		className: `absolute ${center ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : left ? "left-6 top-24 -rotate-12" : "right-6 top-24 rotate-12"} rounded-xl border-4 px-3 py-1 text-2xl font-black tracking-widest ${{
			hot: "border-primary text-primary",
			gold: "border-gold text-gold",
			mute: "border-foreground/70 text-foreground/80"
		}[tone]}`,
		children: label
	});
}
//#endregion
export { Discover as component };
