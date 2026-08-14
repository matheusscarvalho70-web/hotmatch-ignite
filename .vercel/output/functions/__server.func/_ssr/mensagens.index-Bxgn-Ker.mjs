import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useAppState, r as supabase } from "./store-ClKvk3xj.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as Search } from "../_libs/lucide-react.mjs";
import { i as useProfiles } from "./use-profiles-CEB_wMDR.mjs";
import { t as TopBar } from "./TopBar-CMUbpZHY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mensagens.index-Bxgn-Ker.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Messages() {
	const { profileId } = useAppState();
	const { profiles } = useProfiles();
	const [unreadCounts, setUnreadCounts] = (0, import_react.useState)({});
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [matchedUserIds, setMatchedUserIds] = (0, import_react.useState)([]);
	const storageKey = `read_chats_${profileId}`;
	(0, import_react.useEffect)(() => {
		if (!profileId) return;
		async function fetchMatches() {
			const { data, error } = await supabase.from("mutual_matches").select("user_1, user_2").or(`user_1.eq.${profileId},user_2.eq.${profileId}`);
			if (!error && data) {
				const ids = [];
				data.forEach((match) => {
					if (match.user_1 === profileId) ids.push(match.user_2);
					else if (match.user_2 === profileId) ids.push(match.user_1);
				});
				setMatchedUserIds(ids);
			}
		}
		fetchMatches();
	}, [profileId]);
	(0, import_react.useEffect)(() => {
		if (!profileId) return;
		async function fetchCounts() {
			const { data, error } = await supabase.from("chat_messages").select("sender_id, receiver_id, created_at").eq("receiver_id", profileId);
			if (!error && data) {
				let readCache = {};
				try {
					readCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
				} catch (e) {}
				const counts = {};
				data.forEach((m) => {
					const sender = String(m.sender_id || "").trim();
					if (sender && sender !== profileId) {
						const lastReadTime = readCache[sender];
						if (!lastReadTime || new Date(m.created_at) > new Date(lastReadTime)) counts[sender] = (counts[sender] || 0) + 1;
					}
				});
				setUnreadCounts(counts);
			}
		}
		fetchCounts();
	}, [profileId, storageKey]);
	const handleOpenChat = (senderId) => {
		try {
			let readCache = {};
			try {
				readCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
			} catch (e) {}
			readCache[senderId] = (/* @__PURE__ */ new Date()).toISOString();
			localStorage.setItem(storageKey, JSON.stringify(readCache));
			setUnreadCounts((prev) => ({
				...prev,
				[senderId]: 0
			}));
		} catch (e) {}
	};
	const displayProfiles = profiles.filter((p) => matchedUserIds.includes(p.id));
	const filteredProfiles = displayProfiles.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { title: "Mensagens" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						placeholder: "Buscar conversa",
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						className: "w-full h-11 pl-10 pr-4 rounded-full bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
					})]
				})
			}),
			!searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: "Matches Recentes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-4 overflow-x-auto px-4 mt-3 pb-2 scrollbar-none",
					children: displayProfiles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 text-sm text-muted-foreground",
						children: "Nenhum match recente ainda."
					}) : displayProfiles.map((p) => {
						const profileKey = String(p.id || "").trim();
						const unread = unreadCounts[profileKey] || 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/mensagens/$chatId",
							params: { chatId: p.id },
							onClick: () => handleOpenChat(profileKey),
							className: "flex flex-col items-center gap-1.5 shrink-0 group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative p-0.5 rounded-full bg-gradient-to-tr from-primary via-accent to-primary",
								children: [p.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.avatar_url,
									alt: p.name,
									className: "size-16 rounded-full object-cover border-2 border-background"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-16 rounded-full bg-surface-2 border-2 border-background" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background shadow-md",
									children: unread > 9 ? "9+" : unread
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-foreground truncate w-16 text-center",
								children: p.name
							})]
						}, `match-${p.id}`);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground",
					children: "Conversas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 px-2",
					children: filteredProfiles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-4 py-3 text-sm text-muted-foreground",
						children: "Nenhuma conversa iniciada."
					}) : filteredProfiles.map((p) => {
						const profileKey = String(p.id || "").trim();
						const unread = unreadCounts[profileKey] || 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/mensagens/$chatId",
							params: { chatId: p.id },
							onClick: () => handleOpenChat(profileKey),
							className: "flex items-center gap-3 rounded-2xl px-2 py-3 active:bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative shrink-0",
								children: [p.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.avatar_url,
									alt: p.name,
									className: "size-14 rounded-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-14 rounded-full bg-surface-2" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground ring-2 ring-background shadow-md",
									children: unread > 9 ? "9+" : unread
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-bold",
										children: p.name
									}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary shrink-0",
										children: [
											unread,
											" nova",
											unread > 1 ? "s" : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `mt-0.5 truncate text-sm ${unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`,
									children: unread > 0 ? `${unread} nova(s) mensagem(ns)` : `Conversar com ${p.name}`
								})]
							})]
						}) }, p.id);
					})
				})]
			})
		]
	});
}
//#endregion
export { Messages as component };
