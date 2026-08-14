import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useAppState, n as formatBRL, r as supabase, t as actions } from "./store-ClKvk3xj.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { $ as ArrowDownToLine, G as Check, L as Crown, R as Coins, a as Wallet, p as Sparkles, r as Zap, u as TrendingUp } from "../_libs/lucide-react.mjs";
import { t as TopBar } from "./TopBar-CMUbpZHY.mjs";
import { t as coinPacks } from "./data-CU6bcBgF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/loja-CVgR1lmb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Store() {
	const { gender } = useAppState();
	const isCreator = gender === "female";
	const [activeTab, setActiveTab] = (0, import_react.useState)("moedas");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { title: isCreator && activeTab === "carteira" ? "Carteira Criadora" : "Loja & VIP" }),
			isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-[3.5rem] z-30 mx-4 mb-4 flex rounded-full border border-border bg-surface p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveTab("moedas"),
					className: `flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-bold transition-all ${activeTab === "moedas" ? "bg-gradient-hot text-primary-foreground shadow-hot" : "text-muted-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }), "Comprar Moedas"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveTab("carteira"),
					className: `flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-bold transition-all ${activeTab === "carteira" ? "bg-gradient-hot text-primary-foreground shadow-hot" : "text-muted-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), "Carteira Criadora"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4",
				children: !isCreator || activeTab === "moedas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyerView, { isCreator }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorView, {})
			})
		]
	});
}
function BuyerView({ isCreator }) {
	const { coins, vip, profileId } = useAppState();
	const [loading, setLoading] = (0, import_react.useState)(null);
	async function startPayment(itemType, packId) {
		if (!profileId) {
			toast.error("Faça login antes de comprar.");
			return;
		}
		setLoading(itemType === "coins" ? "coins" : "vip");
		try {
			const { data, error } = await supabase.functions.invoke("create-payment", { body: {
				profile_id: profileId,
				item_type: itemType,
				pack_id: packId ?? null
			} });
			if (error || !data?.init_point) throw new Error(error?.message ?? "Sem URL de pagamento");
			window.location.href = data.init_point;
		} catch (err) {
			toast.error("Erro ao iniciar pagamento", { description: err instanceof Error ? err.message : "Tente novamente." });
		} finally {
			setLoading(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-5 shadow-card-premium",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -top-10 size-32 rounded-full bg-gold/15 blur-2xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
					children: "Seu saldo"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "mb-1.5 size-7 text-gold" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-4xl font-extrabold tabular-nums text-gradient-gold",
							children: coins
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 text-sm font-medium text-muted-foreground",
							children: "moedas"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Use para desbloquear mídias, enviar mimos e Super Likes."
				}),
				vip && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center gap-1.5 text-xs font-bold text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
						className: "size-3.5",
						fill: "currentColor"
					}), "VIP Gold ativo"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 mt-6 text-sm font-extrabold",
			children: "Recarga rápida via Pix"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3",
			children: coinPacks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => startPayment("coins", p.id),
				disabled: loading !== null,
				className: "tap-scale relative overflow-hidden rounded-3xl border border-border bg-surface p-4 text-left disabled:opacity-50",
				children: [
					p.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-0 top-0 rounded-bl-xl bg-gradient-hot px-2 py-1 text-[9px] font-bold text-primary-foreground",
						children: p.tag
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-6 text-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xl font-extrabold tabular-nums",
						children: p.coins
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium text-muted-foreground",
						children: "moedas"
					}),
					p.bonus > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[11px] font-bold text-gold",
						children: [
							"+",
							p.bonus,
							" bônus VIP"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm font-bold text-foreground",
						children: formatBRL(p.price)
					})
				]
			}, p.id))
		}),
		!isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-surface to-surface-2 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
						className: "size-5 text-gold",
						fill: "currentColor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-base font-extrabold",
						children: ["Plano ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gradient-gold",
							children: "HotMatch VIP Gold"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: [
						"Super Likes ilimitados todos os dias",
						"Veja quem curtiu seu perfil",
						"20% de desconto em todos os mimos",
						"Destaque dourado no Descobrir"
					].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 text-sm text-foreground/85",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 shrink-0 text-gold" }), b]
					}, b))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => startPayment("vip", "vip"),
					disabled: vip || loading !== null,
					className: "tap-scale mt-4 w-full rounded-full bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold disabled:opacity-60",
					children: vip ? "VIP Gold ativo" : loading === "vip" ? "Abrindo Mercado Pago…" : "Assinar por R$ 39,90/mês"
				})
			]
		})
	] });
}
function CreatorView() {
	const { earnings, profileId } = useAppState();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [key, setKey] = (0, import_react.useState)("");
	const [value, setValue] = (0, import_react.useState)("");
	const [salesToday, setSalesToday] = (0, import_react.useState)(0);
	const [giftsTotal, setGiftsTotal] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!profileId) return;
		const todayStart = /* @__PURE__ */ new Date();
		todayStart.setHours(0, 0, 0, 0);
		const iso = todayStart.toISOString();
		supabase.from("feed_posts").select("id", { count: "exact" }).eq("author_id", profileId).gte("created_at", iso).then(({ count }) => setSalesToday(count ?? 0));
		supabase.from("chat_messages").select("id", { count: "exact" }).eq("receiver_id", profileId).eq("message_kind", "gift").then(({ count }) => setGiftsTotal(count ?? 0));
	}, [profileId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden rounded-3xl border border-gold/25 bg-surface p-5 shadow-card-premium",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -top-10 size-32 rounded-full bg-primary/20 blur-2xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
					children: "Saldo acumulado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-4xl font-extrabold text-gradient-gold",
					children: formatBRL(earnings)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }), "Saldo acumulado de vendas e mimos"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpen(true),
					className: "tap-scale mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "size-4" }), "Solicitar saque Pix"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-2 gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-primary" }),
				label: "Posts hoje",
				value: String(salesToday)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-gold" }),
				label: "Mimos recebidos",
				value: String(giftsTotal)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 mt-6 text-sm font-extrabold",
			children: "Transações recentes"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface py-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Nenhuma transação ainda"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Suas vendas e compras aparecerão aqui."
			})]
		}),
		open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-panel w-full max-w-[30rem] rounded-t-[2rem] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-4 h-1 w-10 rounded-full bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-extrabold",
						children: "Solicitar saque"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: ["Disponível: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-gold",
							children: formatBRL(earnings)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-xs font-semibold text-muted-foreground",
						children: "Chave Pix"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: key,
						onChange: (e) => setKey(e.target.value),
						placeholder: "CPF, e-mail ou telefone",
						className: "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-3 block text-xs font-semibold text-muted-foreground",
						children: "Valor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value,
						onChange: (e) => setValue(e.target.value.replace(/[^\d.,]/g, "")),
						inputMode: "decimal",
						placeholder: "R$ 0,00",
						className: "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setOpen(false),
							className: "tap-scale flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-semibold",
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								const amount = Number(value.replace(/\./g, "").replace(",", "."));
								if (!key || !amount) {
									toast.error("Preencha a chave Pix e o valor");
									return;
								}
								actions.withdraw(amount);
								setOpen(false);
								toast("Saque solicitado 💸", { description: "Cai na sua conta em até 24h." });
							},
							className: "tap-scale flex-[1.4] rounded-full bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold",
							children: "Confirmar saque"
						})]
					})
				]
			})
		})
	] });
}
function Stat({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-surface p-4",
		children: [
			icon,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xl font-extrabold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: label
			})
		]
	});
}
//#endregion
export { Store as component };
