import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useAppState, n as formatBRL, r as supabase, t as actions } from "./store-ClKvk3xj.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { $ as ArrowDownToLine, A as Image, B as CircleQuestionMark, D as LogOut, F as Eye, G as Check, H as ChevronUp, J as Camera, L as Crown, M as Heart, N as Gift, O as Lock, Q as ArrowLeft, R as Coins, T as MessageCircle, U as ChevronRight, V as CircleCheck, W as ChevronDown, f as Star, g as Settings, h as Shield, i as X, k as LoaderCircle, l as TriangleAlert, m as ShoppingCart, o as Users, q as ChartNoAxesColumn, r as Zap, u as TrendingUp, x as Plus, y as Save, z as Clock } from "../_libs/lucide-react.mjs";
import { n as useProfile, r as useProfileStats } from "./use-profiles-CEB_wMDR.mjs";
import { t as TopBar } from "./TopBar-CMUbpZHY.mjs";
import { t as Lightbox } from "./Lightbox-DdL36lPv.mjs";
import { t as Route } from "./perfil-DEpHPiFD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/perfil-CVwrAaS_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function buildSlots(urls, count) {
	const slots = Array.from({ length: count }, () => ({ kind: "empty" }));
	(urls ?? []).slice(0, count).forEach((url, i) => {
		slots[i] = {
			kind: "existing",
			url
		};
	});
	return slots;
}
function slotSrc(s) {
	if (s.kind === "existing") return s.url;
	if (s.kind === "new") return s.preview;
	return null;
}
async function uploadFile(bucket, file, path) {
	const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
		upsert: true,
		contentType: file.type
	});
	if (error) {
		console.error("[Upload] Failed:", error.message);
		toast.error(`Erro ao enviar imagem: ${error.message}`);
		return null;
	}
	const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
	return publicUrl;
}
function EditProfileModal({ open, onClose, onSaved, profile }) {
	const { gender, profileId, name: storeName, avatarUrl: storeAvatar, coins, earnings } = useAppState();
	const isCreator = gender === "female";
	const [name, setName] = (0, import_react.useState)(storeName || "");
	const [age, setAge] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [avatarPreview, setAvatarPreview] = (0, import_react.useState)(storeAvatar);
	const [avatarFile, setAvatarFile] = (0, import_react.useState)(null);
	const [publicSlots, setPublicSlots] = (0, import_react.useState)(buildSlots([], 3));
	const [vipSlots, setVipSlots] = (0, import_react.useState)(buildSlots([], 6));
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [uploadingAvatar, setUploadingAvatar] = (0, import_react.useState)(false);
	const avatarInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setName(profile?.name ?? storeName ?? "");
		setAge(profile?.age != null ? String(profile.age) : "");
		setBio(profile?.bio ?? "");
		setLocation(profile?.location ?? "");
		setAvatarPreview(profile?.avatar_url ?? storeAvatar ?? null);
		setAvatarFile(null);
		setPublicSlots(buildSlots(profile?.public_photos, 3));
		setVipSlots(buildSlots(profile?.vip_photos, isCreator ? 6 : 0));
	}, [open]);
	function onAvatarPick(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatarFile(file);
		setAvatarPreview(URL.createObjectURL(file));
	}
	function handleGalleryPick(e, index, kind) {
		const file = e.target.files?.[0];
		if (!file) return;
		const newSlot = {
			kind: "new",
			file,
			preview: URL.createObjectURL(file)
		};
		if (kind === "public") setPublicSlots((prev) => prev.map((s, i) => i === index ? newSlot : s));
		else setVipSlots((prev) => prev.map((s, i) => i === index ? newSlot : s));
		e.target.value = "";
	}
	function handleGalleryRemove(index, kind) {
		const empty = { kind: "empty" };
		if (kind === "public") setPublicSlots((prev) => prev.map((s, i) => i === index ? empty : s));
		else setVipSlots((prev) => prev.map((s, i) => i === index ? empty : s));
	}
	async function save() {
		if (!profileId) {
			toast.error("Faça login para editar o perfil.");
			return;
		}
		setSaving(true);
		try {
			let newAvatarUrl = null;
			if (avatarFile) {
				setUploadingAvatar(true);
				const ext = avatarFile.name.split(".").pop() ?? "jpg";
				newAvatarUrl = await uploadFile("avatars", avatarFile, `${profileId}/avatar_${Date.now()}.${ext}`);
				setUploadingAvatar(false);
				if (!newAvatarUrl) {
					setSaving(false);
					return;
				}
			}
			const finalAvatarUrl = newAvatarUrl ?? profile?.avatar_url ?? storeAvatar;
			const publicBucket = "user_photos";
			const vipBucket = "vip-photos";
			const publicUrls = [];
			for (let i = 0; i < publicSlots.length; i++) {
				const slot = publicSlots[i];
				if (slot.kind === "existing") publicUrls.push(slot.url);
				else if (slot.kind === "new") {
					const ext = slot.file.name.split(".").pop() ?? "jpg";
					const url = await uploadFile(publicBucket, slot.file, `${profileId}/public_${Date.now()}_${i}.${ext}`);
					if (url) publicUrls.push(url);
				}
			}
			let vipUrls = [];
			if (isCreator) for (let i = 0; i < vipSlots.length; i++) {
				const slot = vipSlots[i];
				if (slot.kind === "existing") vipUrls.push(slot.url);
				else if (slot.kind === "new") {
					const ext = slot.file.name.split(".").pop() ?? "jpg";
					const url = await uploadFile(vipBucket, slot.file, `${profileId}/vip_${Date.now()}_${i}.${ext}`);
					if (url) vipUrls.push(url);
				}
			}
			const updatePayload = { public_photos: publicUrls };
			if (isCreator) updatePayload.vip_photos = vipUrls;
			if (name.trim()) updatePayload.name = name.trim();
			if (age.trim() && !isNaN(Number(age))) updatePayload.age = Number(age);
			if (bio.trim()) updatePayload.bio = bio.trim();
			if (location.trim()) updatePayload.location = location.trim();
			if (newAvatarUrl) updatePayload.avatar_url = newAvatarUrl;
			const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profileId);
			if (error) throw new Error(error.message);
			actions.setProfile({
				profileId,
				gender,
				name: updatePayload.name ?? storeName,
				avatarUrl: finalAvatarUrl ?? storeAvatar,
				coins,
				earnings
			});
			toast.success("Perfil atualizado! ✨");
			onSaved?.();
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
		} finally {
			setSaving(false);
		}
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background",
			style: { maxHeight: "92dvh" },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-border" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-extrabold",
						children: "Editar Perfil"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid size-8 place-items-center rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 px-5 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold",
										children: avatarPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: avatarPreview,
											alt: "Avatar",
											className: "size-full rounded-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full rounded-full bg-surface-2" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => avatarInputRef.current?.click(),
										disabled: uploadingAvatar,
										className: "tap-scale absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-gradient-hot shadow-hot disabled:opacity-70",
										children: uploadingAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 text-white animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-3.5 text-white" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: avatarInputRef,
										type: "file",
										accept: "image/*",
										className: "hidden",
										onChange: onAvatarPick
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Selecione da galeria ou tire uma foto"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Nome",
									value: name,
									onChange: setName,
									placeholder: storeName || "Seu nome"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Idade",
									value: age,
									onChange: setAge,
									type: "number",
									placeholder: "Ex: 25"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "Bio"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: bio,
										onChange: (e) => setBio(e.target.value),
										rows: 3,
										placeholder: "Conte algo sobre você...",
										className: "w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Localização",
									value: location,
									onChange: setLocation,
									placeholder: "Ex: São Paulo, SP"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
							children: "Galeria Pública · 3 fotos"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: publicSlots.map((slot, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GallerySlot, {
								src: slotSrc(slot),
								onPick: (e) => handleGalleryPick(e, i, "public"),
								onRemove: () => handleGalleryRemove(i, "public")
							}, i))
						})] }),
						isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
							children: [
								"Galeria VIP ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-2.5 text-gold" }),
								" · 6 slots"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: vipSlots.map((slot, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GallerySlot, {
								src: slotSrc(slot),
								onPick: (e) => handleGalleryPick(e, i, "vip"),
								onRemove: () => handleGalleryRemove(i, "vip"),
								vip: true
							}, i))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: save,
							disabled: saving,
							className: "tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hot py-3.5 text-sm font-extrabold text-primary-foreground shadow-hot disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), saving ? "Salvando..." : "Salvar alterações"]
						})
					]
				})
			]
		})
	});
}
function Field({ label, value, onChange, type = "text", placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			className: "text-xs font-semibold text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			className: "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
		})]
	});
}
function GallerySlot({ src, onPick, onRemove, vip }) {
	const inputRef = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tap-scale relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface-2",
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "",
				className: "size-full object-cover"
			}),
			vip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute left-1 top-1 grid size-4 place-items-center rounded-full bg-black/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-2.5 text-gold" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onRemove,
				className: "absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3 text-white" })
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => inputRef.current?.click(),
			className: "absolute inset-0 flex items-center justify-center text-muted-foreground/50",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-6" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: inputRef,
			type: "file",
			accept: "image/*",
			className: "hidden",
			onChange: onPick
		})]
	});
}
var BLOCKED = [];
var PRIVACY_POLICY_TEXT = `Política de Privacidade – HotMatch

Última atualização: agosto de 2026

A sua privacidade é fundamental para nós. Esta política descreve como coletamos, usamos e protegemos seus dados no HotMatch, um aplicativo de relacionamento e conexão entre pessoas.

1. Dados que coletamos
- Informações de cadastro: nome, idade, e-mail, gênero e localização aproximada.
- Fotos e mídias enviadas por você (públicas e VIP).
- Dados de atividade: curtidas, matches, mensagens e interações.
- Dados de pagamento: transações de moedas e saques (processados de forma segura).

2. Como usamos seus dados
- Para conectar você com outras pessoas próximas.
- Para exibir e recomendar perfis compatíveis.
- Para garantir a segurança da plataforma e prevenir abusos.
- Para processar pagamentos e saques de criadoras.

3. Compartilhamento
Seus dados não são vendidos a terceiros. Compartilhamos apenas informações necessárias com prestadores de serviço (ex: infraestrutura e pagamentos), sempre sob sigilo.

4. Armazenamento e segurança
Utilizamos criptografia e boas práticas de segurança. Seus dados são armazenados em servidores protegidos.

5. Seus direitos
Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento através da opção "Excluir conta" no aplicativo.

6. Menores de idade
O HotMatch é destinado exclusivamente a maiores de 18 anos.

Para dúvidas, entre em contato através do suporte no aplicativo.`;
var TERMS_OF_USE_TEXT = `Termos de Uso – HotMatch

Última atualização: agosto de 2026

Ao utilizar o HotMatch, você concorda com os seguintes termos:

1. Elegibilidade
Você declara ter 18 anos ou mais e fornecer informações verdadeiras no cadastro.

2. Conduta do usuário
- É proibido publicar conteúdo ilegal, ofensivo, sexual explícito não consentido, ou que viole direitos de terceiros.
- É proibido assediar, ameaçar ou discriminar outros usuários.
- É proibido criar perfis falsos ou se passar por outra pessoa.

3. Conteúdo e mídia
Você é responsável por todo conteúdo que publica. Conteúdo VIP é de responsabilidade da criadora, que define o preço e o acesso.

4. Moedas e pagamentos
- Moedas virtuais não têm valor fora do aplicativo.
- Saques estão sujeitos a verificação de identidade e regras internas.
- Compras de moedas não são reembolsáveis, exceto em casos previstos em lei.

5. Verificação de identidade
Criadoras podem solicitar verificação para obter o selo "Criadora Verificada", garantindo mais segurança para todos.

6. Suspensão de contas
O descumprimento destes termos pode resultar em suspensão ou exclusão permanente da conta.

7. Limitação de responsabilidade
O HotMatch é uma plataforma de intermediação. Não nos responsabilizamos por encontros, conversas ou acordos entre usuários.

8. Alterações
Estes termos podem ser atualizados a qualquer momento. Recomendamos revisá-los periodicamente.

Para dúvidas, entre em contato através do suporte no aplicativo.`;
function PrivacyModal({ open, onClose }) {
	const { gender, profileId } = useAppState();
	const isCreator = gender === "female";
	const [readReceipts, setReadReceipts] = (0, import_react.useState)(false);
	const [verifying, setVerifying] = (0, import_react.useState)(false);
	const [verified, setVerified] = (0, import_react.useState)(true);
	const [legalModal, setLegalModal] = (0, import_react.useState)(null);
	const [deleteModal, setDeleteModal] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	function startVerification() {
		setVerifying(true);
		setTimeout(() => {
			setVerifying(false);
			setVerified(true);
			toast("Identidade verificada! ✅", {
				description: "Seu selo de Criadora Verificada está ativo.",
				className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl"
			});
		}, 2200);
	}
	async function handleDeleteAccount() {
		if (!profileId) return;
		setDeleting(true);
		try {
			const { error } = await supabase.from("profiles").delete().eq("id", profileId);
			if (error) throw error;
			actions.signOut();
			toast("Conta excluída permanentemente", {
				description: "Todos os seus dados foram removidos.",
				className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl"
			});
			onClose();
		} catch {
			toast("Erro ao excluir conta", {
				description: "Tente novamente ou contate o suporte.",
				className: "bg-red-50 text-red-900 border border-red-200 shadow-xl rounded-2xl"
			});
		} finally {
			setDeleting(false);
		}
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm",
			onClick: onClose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background",
				style: { maxHeight: "90dvh" },
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center pt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-border" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-extrabold",
							children: "Privacidade e Verificação"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "grid size-8 place-items-center rounded-full bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6 px-5 pb-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
								title: "Visibilidade",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Confirmação de leitura",
									description: "Avisa quando você lê mensagens no chat",
									value: readReceipts,
									onChange: setReadReceipts
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
								title: "Contas Bloqueadas",
								children: BLOCKED.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "py-3 text-sm text-muted-foreground",
									children: "Nenhuma conta bloqueada por enquanto."
								}) : BLOCKED.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 py-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-9 overflow-hidden rounded-full bg-surface-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: b.avatar,
												alt: b.name,
												className: "size-full object-cover"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 text-sm font-medium",
											children: b.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "text-xs font-bold text-primary",
											children: "Desbloquear"
										})
									]
								}, b.name))
							}),
							isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
								title: "Verificação de Identidade",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-border bg-surface p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `grid size-10 place-items-center rounded-full ${verified ? "bg-emerald-500/15" : "bg-amber-500/15"}`,
												children: verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-emerald-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5 text-amber-400" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-bold",
													children: verified ? "Criadora Verificada ✅" : "Verificação pendente"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: verified ? "Seu perfil possui o selo oficial HotMatch" : "Envie um documento para ativar o selo"
												})]
											})]
										}),
										!verified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: startVerification,
											disabled: verifying,
											className: "tap-scale mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hot py-3 text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), verifying ? "Verificando..." : "Iniciar verificação de identidade"]
										}),
										verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: [
												"Rosto verificado",
												"Documento válido",
												"Maior de 18"
											].map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), tag]
											}, tag))
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
								title: "Dados e Privacidade",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setLegalModal("privacy"),
										className: "flex w-full items-center justify-between py-3 text-sm text-foreground/80 active:bg-surface-2",
										children: ["Política de privacidade", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setLegalModal("terms"),
										className: "flex w-full items-center justify-between py-3 text-sm text-foreground/80 active:bg-surface-2",
										children: ["Termos de uso", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setDeleteModal(true),
										className: "flex w-full items-center justify-between py-3 text-sm font-semibold text-red-500 active:bg-surface-2",
										children: ["Excluir conta", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-red-400" })]
									})
								]
							})
						]
					})
				]
			})
		}),
		legalModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm",
			onClick: () => setLegalModal(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[30rem] overflow-y-auto rounded-3xl border border-border bg-background",
				style: { maxHeight: "85dvh" },
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-extrabold",
						children: legalModal === "privacy" ? "Política de Privacidade" : "Termos de Uso"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setLegalModal(null),
						className: "grid size-8 place-items-center rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "whitespace-pre-line px-5 py-5 text-[13px] leading-relaxed text-foreground/80",
					children: legalModal === "privacy" ? PRIVACY_POLICY_TEXT : TERMS_OF_USE_TEXT
				})]
			})
		}),
		deleteModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm",
			onClick: () => !deleting && setDeleteModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[26rem] rounded-3xl border border-red-500/30 bg-background p-6",
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-4 grid size-14 place-items-center rounded-full bg-red-500/15",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-7 text-red-500" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-2 text-center text-lg font-extrabold text-red-500",
						children: "Excluir conta permanentemente"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-5 text-center text-sm text-muted-foreground",
						children: [
							"Esta ação é ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-red-500",
								children: "irreversível"
							}),
							". Leia com atenção:"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mb-6 space-y-2.5 text-sm text-foreground/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-red-400" }), "Seu perfil, fotos e mídias serão apagados permanentemente."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-red-400" }), "Todos os seus matches e conexões serão perdidos."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-red-400" }), "O histórico de mensagens e conversas será excluído."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-red-400" }), "Moedas e saldo de saques não poderão ser recuperados."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-red-400" }), "Não será possível reativar a conta após a exclusão."]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setDeleteModal(false),
							disabled: deleting,
							className: "flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-bold text-foreground disabled:opacity-50",
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleDeleteAccount,
							disabled: deleting,
							className: "flex-1 rounded-full bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 disabled:opacity-60",
							children: deleting ? "Excluindo..." : "Excluir definitivamente"
						})]
					})
				]
			})
		})
	] });
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-2xl border border-border bg-surface divide-y divide-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4",
			children
		})
	})] });
}
function Toggle({ label, description, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 py-3.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: description
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			role: "switch",
			"aria-checked": value,
			onClick: () => onChange(!value),
			className: `tap-scale relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? "bg-primary" : "bg-surface-2 border border-border"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}` })
		})]
	});
}
function EarningsDrawer({ open, onClose }) {
	const { earnings } = useAppState();
	const [amount, setAmount] = (0, import_react.useState)("");
	const [pix, setPix] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	function requestWithdraw() {
		const value = parseFloat(amount.replace(",", "."));
		if (!pix.trim()) {
			toast.error("Informe sua chave Pix.");
			return;
		}
		if (isNaN(value) || value < 50) {
			toast.error("Valor mínimo de saque é R$ 50,00.");
			return;
		}
		if (value > earnings) {
			toast.error("Saldo insuficiente para este saque.");
			return;
		}
		setLoading(true);
		setTimeout(() => {
			actions.withdraw(value);
			setLoading(false);
			setAmount("");
			toast("Saque solicitado! 💸", {
				description: `${formatBRL(value)} será transferido em até 2h via Pix.`,
				className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl"
			});
		}, 1500);
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background",
			style: { maxHeight: "90dvh" },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-border" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-extrabold",
						children: "Dashboard de Ganhos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid size-8 place-items-center rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 px-5 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-3xl bg-gradient-to-br from-gold/20 via-pink-500/10 to-surface border border-gold/25 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
									children: "Saldo disponível"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-4xl font-extrabold text-gradient-gold tabular-nums",
									children: formatBRL(earnings)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center gap-1.5 text-xs text-emerald-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+12% vs. semana passada" })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-3",
							children: [
								{
									label: "Este mês",
									value: "R$\xA0892",
									color: "text-foreground"
								},
								{
									label: "Mimos",
									value: "R$\xA0340",
									color: "text-gold"
								},
								{
									label: "Mídias VIP",
									value: "R$\xA0552",
									color: "text-primary"
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-surface p-3 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-base font-extrabold tabular-nums ${s.color}`,
									children: s.value
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: s.label
								})]
							}, s.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-surface p-4 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold",
									children: "Solicitar saque via Pix"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "Chave Pix (CPF, e-mail ou telefone)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: pix,
										onChange: (e) => setPix(e.target.value),
										placeholder: "000.000.000-00",
										className: "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "Valor (mín. R$ 50,00)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground",
											children: "R$"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: amount,
											onChange: (e) => setAmount(e.target.value),
											placeholder: "0,00",
											className: "w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: requestWithdraw,
									disabled: loading,
									className: "tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3 text-sm font-extrabold text-gold-foreground shadow-gold disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "size-4" }), loading ? "Processando..." : "Solicitar saque"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
							children: "Histórico de transações"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Nenhuma transação ainda"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Suas vendas aparecerão aqui."
							})]
						})] })
					]
				})
			]
		})
	});
}
var VIP_PERKS = [
	"Super Likes ilimitados todos os dias",
	"Veja quem curtiu seu perfil",
	"20% de desconto em mimos e presentes",
	"Destaque dourado no Feed e no Descobrir"
];
function VipModal({ open, onClose }) {
	const { vip, coins } = useAppState();
	const navigate = useNavigate();
	function activate() {
		if (coins < 200) {
			toast.error("Saldo insuficiente. Recarregue moedas para ativar o VIP (200 moedas = R$ 39,90).");
			return;
		}
		actions.spendCoins(200);
		actions.activateVip();
		toast("VIP ativado! 👑", {
			description: "Você agora tem acesso a todos os benefícios exclusivos.",
			className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl"
		});
		onClose();
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[22rem] overflow-hidden rounded-3xl border border-gold/30 bg-surface shadow-[0_0_40px_oklch(0.86_0.16_92/0.2)]",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative bg-gradient-to-br from-gold/20 via-pink-500/10 to-transparent p-5 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-surface-2/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
						className: "size-8 text-gold",
						fill: "currentColor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-xl font-extrabold text-gold",
						children: vip ? "VIP Ativo 👑" : "Assinar VIP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: vip ? "Você já tem acesso a todos os benefícios exclusivos." : "Desbloqueie acesso completo à plataforma."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-2xl border border-border bg-surface-2 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Saldo atual"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-base font-extrabold text-gold tabular-nums",
								children: [coins, " moedas"]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								onClose();
								navigate({ to: "/loja" });
							},
							className: "tap-scale flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-foreground border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "size-3.5" }), "Recarregar"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
						children: "Benefícios incluídos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: VIP_PERKS.map((perk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2.5 text-sm text-foreground/85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `grid size-5 shrink-0 place-items-center rounded-full ${vip ? "bg-emerald-500/20" : "bg-gold/15"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: `size-3 ${vip ? "text-emerald-400" : "text-gold"}` })
							}), perk]
						}, perk))
					})] }),
					vip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-bold text-emerald-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Assinatura ativa"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Custo de ativação"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-2xl font-extrabold text-gold",
								children: ["R$ 39,90", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-muted-foreground",
									children: "/mês"
								})]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-primary/20 px-2 py-1 text-[10px] font-bold text-primary",
								children: "Mensal"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: activate,
							className: "tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }), "Ativar VIP agora"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							onClose();
							navigate({ to: "/loja" });
						},
						className: "tap-scale w-full rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground",
						children: "Ver pacotes de moedas na loja"
					})
				]
			})]
		})
	});
}
function StatsDrawer({ open, onClose }) {
	const { gender, followed, profileId } = useAppState();
	const isCreator = gender === "female";
	const { stats, loading } = useProfileStats(profileId);
	const creatorStats = [
		{
			icon: Eye,
			label: "Visualizações",
			value: "0",
			sub: "Em breve",
			color: "text-foreground"
		},
		{
			icon: Heart,
			label: "Curtidas",
			value: stats.likesTotal.toLocaleString("pt-BR"),
			sub: "Total acumulado",
			color: "text-primary"
		},
		{
			icon: Star,
			label: "Mimos recebidos",
			value: stats.giftsReceived.toLocaleString("pt-BR"),
			sub: "Total acumulado",
			color: "text-gold"
		},
		{
			icon: Users,
			label: "Posts publicados",
			value: stats.postCount.toLocaleString("pt-BR"),
			sub: "Feed VIP",
			color: "text-cyan-400"
		}
	];
	const maleStats = [
		{
			icon: Heart,
			label: "Curtidas enviadas",
			value: stats.likesTotal.toLocaleString("pt-BR"),
			sub: "Total acumulado",
			color: "text-primary"
		},
		{
			icon: Users,
			label: "Criadoras que sigo",
			value: String(followed.length),
			sub: "Perfis salvos",
			color: "text-gold"
		},
		{
			icon: Eye,
			label: "Perfis visitados",
			value: "0",
			sub: "Em breve",
			color: "text-foreground"
		},
		{
			icon: ChartNoAxesColumn,
			label: "Posts desbloqueados",
			value: "0",
			sub: "Mídias VIP",
			color: "text-cyan-400"
		}
	];
	const displayStats = isCreator ? creatorStats : maleStats;
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background",
			style: { maxHeight: "88dvh" },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-border" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumn, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-extrabold",
							children: "Estatísticas do Perfil"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid size-8 place-items-center rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 px-5 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary",
								children: "Acumulado"
							}), !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-xs text-emerald-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }), "Dados reais"]
							})]
						}),
						loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3",
							children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl bg-surface" }, i))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3",
							children: displayStats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-surface p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: `size-5 ${s.color}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `mt-2 text-2xl font-extrabold tabular-nums ${s.color}`,
										children: s.value
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-foreground/80",
										children: s.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[10px] text-muted-foreground",
										children: s.sub
									})
								]
							}, s.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-gold/25 bg-gold/5 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-bold text-gold",
										children: "Taxa de engajamento"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xl font-extrabold text-gold",
										children: stats.postCount > 0 && stats.likesTotal > 0 ? `${Math.min(100, Math.round(stats.likesTotal / (stats.postCount * 100) * 100))}%` : "0%"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 h-2 overflow-hidden rounded-full bg-surface-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all",
										style: { width: stats.postCount > 0 && stats.likesTotal > 0 ? `${Math.min(100, Math.round(stats.likesTotal / (stats.postCount * 100) * 100))}%` : "0%" }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-[11px] text-muted-foreground",
									children: stats.postCount === 0 ? "Publique conteúdo VIP para calcular seu engajamento" : "Com base em curtidas por post"
								})
							]
						})
					]
				})
			]
		})
	});
}
var FAQS = [
	{
		q: "Como faço um saque Pix?",
		a: "Acesse 'Dashboard de ganhos' no seu perfil, informe sua chave Pix e o valor (mínimo R$ 50,00). O pagamento é processado em até 2 horas."
	},
	{
		q: "Como ativar o VIP?",
		a: "Acesse 'Gerenciar assinatura VIP' ou clique no badge de moedas no topo. O VIP custa 200 moedas/mês e libera recursos exclusivos."
	},
	{
		q: "Minha verificação facial falhou. O que fazer?",
		a: "Certifique-se de usar boa iluminação e posicionar o rosto centralmente. Se o problema persistir, entre em contato com o suporte."
	},
	{
		q: "Como denunciar um perfil suspeito?",
		a: "Acesse o perfil da pessoa, toque no menu '...' e selecione 'Denunciar'. Nossa equipe analisa em até 24 horas."
	},
	{
		q: "Posso usar o HotMatch em mais de um dispositivo?",
		a: "Sim. Sua conta sincroniza automaticamente. Por segurança, você será desconectado de sessões antigas ao fazer login em um novo aparelho."
	}
];
function SupportModal({ open, onClose }) {
	const { gender } = useAppState();
	const visibleFaqs = gender === "female" ? FAQS.filter((f) => !f.q.includes("VIP")) : FAQS;
	const [expanded, setExpanded] = (0, import_react.useState)(null);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background",
			style: { maxHeight: "90dvh" },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-border" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-extrabold",
							children: "Suporte HotMatch"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid size-8 place-items-center rounded-full bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-muted-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 px-5 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "mailto:suporte@hotmatch.app",
								className: "tap-scale flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✉️" }), "E-mail"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://wa.me/5511999999999?text=Preciso+de+ajuda+no+HotMatch",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "tap-scale flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), "WhatsApp"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-center text-muted-foreground",
							children: "Atendimento disponível das 9h às 22h (horário de Brasília)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
							children: "Perguntas frequentes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "overflow-hidden rounded-2xl border border-border bg-surface divide-y divide-border",
							children: visibleFaqs.map((faq, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setExpanded(expanded === i ? null : i),
								className: "flex w-full items-start gap-3 px-4 py-4 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 flex-1 text-sm font-semibold",
									children: faq.q
								}), expanded === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground" })]
							}), expanded === i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 pb-4 text-sm leading-relaxed text-muted-foreground",
								children: faq.a
							})] }, i))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-[10px] text-muted-foreground/50",
							children: "HotMatch v1.0.0 · Todos os direitos reservados"
						})
					]
				})
			]
		})
	});
}
var VIP_DEFAULT_PRICE = 15;
function ProfilePage() {
	const { uid, from } = Route.useSearch();
	const { gender, vip, profileId, name: storeName, avatarUrl: storeAvatar } = useAppState();
	const navigate = useNavigate();
	const [modal, setModal] = (0, import_react.useState)(null);
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	const [selectedImage, setSelectedImage] = (0, import_react.useState)(null);
	const viewingOther = !!uid && uid !== profileId;
	const targetId = uid ?? profileId ?? "";
	const { profile, loading } = useProfile(targetId, refreshKey);
	const { stats } = useProfileStats(viewingOther ? null : profileId);
	const isCreator = (profile?.gender ?? gender) === "female";
	const displayName = profile?.name ?? storeName;
	const displayAge = profile?.age ?? null;
	const displayBio = profile?.bio ?? "";
	const displayAvatar = profile?.avatar_url ?? storeAvatar;
	const livePublic = profile?.public_photos ?? [];
	const liveVip = profile?.vip_photos ?? [];
	const [dbUnlocks, setDbUnlocks] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!profileId || !viewingOther) {
			setDbUnlocks([]);
			return;
		}
		supabase.from("vip_gallery_unlocks").select("creator_id").eq("visitor_id", profileId).then(({ data }) => {
			if (data) setDbUnlocks(data.map((r) => r.creator_id));
		});
	}, [profileId, viewingOther]);
	if (viewingOther && profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitorProfile, {
		profile,
		publicPhotos: livePublic,
		vipPhotos: liveVip,
		isUnlocked: dbUnlocks.includes(targetId),
		from,
		onBack: () => from ? navigate({
			to: "/mensagens/$chatId",
			params: { chatId: from }
		}) : navigate({ to: "/feed" }),
		onImageClick: setSelectedImage
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { title: "Perfil" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-4 h-36 overflow-hidden rounded-3xl border border-white/10 shadow-lg",
				children: [displayAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: displayAvatar,
					alt: "Capa",
					className: "size-full object-cover object-top filter brightness-90"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full bg-gradient-to-br from-surface-2 to-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mt-12 flex flex-col items-center px-4 relative z-10",
				children: [
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-24 rounded-full bg-surface-2 animate-pulse" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-24 shrink-0 place-items-center overflow-hidden rounded-full p-[3px] ring-match shadow-gold bg-background",
						children: displayAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: displayAvatar,
							alt: displayName,
							className: "size-full rounded-full object-cover object-center"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full rounded-full bg-surface-2" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl font-extrabold",
							children: [displayName, displayAge ? `, ${displayAge}` : ""]
						}), profile?.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
							className: "size-4 text-gold",
							fill: "currentColor"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mt-1 rounded-full border px-3 py-1 text-[11px] font-bold ${isCreator ? "border-gold/40 bg-gold/10 text-gold" : "border-primary/30 bg-primary/10 text-primary"}`,
						children: isCreator ? vip ? "VIP Gold ativo" : "Criadora Verificada" : "Membro VIP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xs text-center text-sm text-muted-foreground",
						children: displayBio
					})
				]
			}),
			isCreator ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorProfile, {
				navigate,
				onMenu: setModal,
				publicPhotos: livePublic,
				vipPhotos: liveVip,
				stats,
				onImageClick: setSelectedImage
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaleProfile, {
				navigate,
				onMenu: setModal,
				publicPhotos: livePublic,
				stats,
				onImageClick: setSelectedImage
			}),
			selectedImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
				src: selectedImage,
				onClose: () => setSelectedImage(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProfileModal, {
				open: modal === "edit",
				onClose: () => setModal(null),
				profile,
				onSaved: () => setRefreshKey((k) => k + 1)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacyModal, {
				open: modal === "privacy",
				onClose: () => setModal(null)
			}),
			isCreator ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EarningsDrawer, {
				open: modal === "role",
				onClose: () => setModal(null)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VipModal, {
				open: modal === "role",
				onClose: () => setModal(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsDrawer, {
				open: modal === "stats",
				onClose: () => setModal(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportModal, {
				open: modal === "support",
				onClose: () => setModal(null)
			})
		]
	});
}
function VisitorProfile({ profile, publicPhotos, vipPhotos, isUnlocked, from, onBack, onImageClick }) {
	const { vip, profileId, coins, galleryUnlocks } = useAppState();
	const [tab, setTab] = (0, import_react.useState)("public");
	const [unlocked, setUnlocked] = (0, import_react.useState)(isUnlocked || galleryUnlocks.includes(profile.id));
	const [paying, setPaying] = (0, import_react.useState)(false);
	const price = profile.gallery_price || VIP_DEFAULT_PRICE;
	const hasPublic = publicPhotos.length > 0;
	const hasVip = vipPhotos.length > 0;
	async function handleUnlock() {
		if (!profileId || unlocked) return;
		if (coins < price) return toast.error(`Saldo insuficiente. Precisa de ${price} moedas.`);
		setPaying(true);
		try {
			await supabase.from("profiles").update({ coin_balance: coins - price }).eq("id", profileId);
			await supabase.from("transactions").insert({
				user_id: profileId,
				type: "unlock",
				coins_amount: -price,
				amount: 0
			});
			await supabase.from("vip_gallery_unlocks").upsert({
				visitor_id: profileId,
				creator_id: profile.id,
				coins_paid: price
			}, { onConflict: "visitor_id,creator_id" });
			actions.unlockGallery(profile.id, price);
			setUnlocked(true);
			toast.success("Galeria VIP desbloqueada!");
		} catch {
			toast.error("Erro ao desbloquear.");
		} finally {
			setPaying(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onBack,
				className: "absolute top-4 left-4 z-30 grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { title: profile.name }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-4 h-36 overflow-hidden rounded-3xl border border-white/10 shadow-lg",
				children: [profile.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: profile.avatar_url,
					alt: "Capa",
					className: "size-full object-cover object-top filter brightness-90"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full bg-gradient-to-br from-surface-2 to-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mt-12 flex flex-col items-center px-4 relative z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-24 shrink-0 place-items-center overflow-hidden rounded-full p-[3px] ring-match bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: profile.avatar_url || "",
							alt: profile.name,
							className: "size-full rounded-full object-cover object-center"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-xl font-extrabold",
						children: profile.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: profile.bio
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-4 mt-6 flex rounded-full border bg-surface p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab("public"),
					className: `flex-1 rounded-full py-2 text-xs font-bold ${tab === "public" ? "bg-gradient-hot text-white" : "text-muted-foreground"}`,
					children: "Pública"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab("vip"),
					className: `flex-1 rounded-full py-2 text-xs font-bold ${tab === "vip" ? "bg-gradient-gold text-black" : "text-muted-foreground"}`,
					children: "VIP"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-3 gap-1.5 px-4",
				children: tab === "public" ? hasPublic ? publicPhotos.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt: "Foto",
					onClick: () => onImageClick(src),
					className: "aspect-square w-full cursor-pointer rounded-xl object-cover"
				}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGallery, { text: "Esta criadora ainda não adicionou fotos públicas." }) : hasVip ? vipPhotos.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-square overflow-hidden rounded-xl",
					onClick: () => unlocked && onImageClick(src),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: "VIP",
						className: `size-full object-cover ${unlocked ? "cursor-pointer" : "blur-2xl brightness-50"}`
					}), !unlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute inset-0 m-auto size-5 text-gold" })]
				}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGallery, { text: "Esta criadora ainda não adicionou fotos VIP." })
			}),
			tab === "vip" && hasVip && !unlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-4 mt-4 flex flex-col items-center gap-3 rounded-3xl border border-gold/25 bg-surface p-5 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold",
					children: "Galeria VIP bloqueada"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleUnlock,
					disabled: paying,
					className: "flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-extrabold text-black",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }),
						" ",
						paying ? "Carregando..." : `Desbloquear por ${price} moedas`
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onBack,
				className: "mx-4 mt-6 w-[calc(100%-2rem)] rounded-full border py-3 text-sm text-muted-foreground",
				children: from ? "Voltar ao Chat" : "Voltar ao Feed"
			})
		]
	});
}
function CreatorProfile({ navigate, onMenu, publicPhotos, vipPhotos, stats, onImageClick }) {
	const [tab, setTab] = (0, import_react.useState)("public");
	const hasPublic = publicPhotos.length > 0;
	const hasVip = vipPhotos.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid grid-cols-3 gap-3 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }),
					label: "Visualizações",
					value: "0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 text-primary" }),
					label: "Curtidas",
					value: stats.likesTotal.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-4 text-gold" }),
					label: "Mimos",
					value: stats.giftsReceived.toLocaleString()
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-4 mt-6 flex rounded-full border bg-surface p-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab("public"),
				className: `flex-1 rounded-full py-2 text-xs font-bold ${tab === "public" ? "bg-gradient-hot text-white" : "text-muted-foreground"}`,
				children: "Galeria pública"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab("vip"),
				className: `flex-1 rounded-full py-2 text-xs font-bold ${tab === "vip" ? "bg-gradient-gold text-black" : "text-muted-foreground"}`,
				children: "Galeria VIP"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-3 gap-1.5 px-4",
			children: tab === "public" ? hasPublic ? publicPhotos.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "Foto pública",
				onClick: () => onImageClick(src),
				className: "aspect-square w-full cursor-pointer rounded-xl object-cover"
			}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGallery, { text: "Sua galeria pública está vazia. Adicione fotos em Editar perfil." }) : hasVip ? vipPhotos.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "Foto VIP",
				onClick: () => onImageClick(src),
				className: "aspect-square w-full cursor-pointer rounded-xl object-cover"
			}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGallery, {
				text: "Sua galeria VIP está vazia. Adicione fotos em Editar perfil.",
				isGold: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsMenu, {
			showEarnings: true,
			navigate,
			onMenu
		})
	] });
}
function MaleProfile({ navigate, onMenu, publicPhotos, stats, onImageClick }) {
	const { coins, followed } = useAppState();
	const hasPublic = publicPhotos.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid grid-cols-2 gap-3 px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 text-primary" }),
				label: "Interações",
				value: stats.likesTotal.toLocaleString()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-gold" }),
				label: "Seguindo",
				value: String(followed.length)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-4 mt-5 flex items-center justify-between rounded-2xl border bg-surface p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Saldo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg font-extrabold text-gold",
					children: [coins, " moedas"]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => navigate({ to: "/loja" }),
				className: "rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-black",
				children: "Recarregar"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 grid grid-cols-3 gap-1.5 px-4",
			children: hasPublic ? publicPhotos.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "Foto",
				onClick: () => onImageClick(src),
				className: "aspect-square w-full cursor-pointer rounded-xl object-cover"
			}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyGallery, { text: "Sua galeria está vazia. Adicione fotos em Editar perfil." })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsMenu, {
			navigate,
			onMenu
		})
	] });
}
function EmptyGallery({ text, isGold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "col-span-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface py-8 text-center px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: `size-6 ${isGold ? "text-gold" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-muted-foreground",
			children: text
		})]
	});
}
function SettingsMenu({ navigate, showEarnings, onMenu }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mx-4 mt-6 overflow-hidden rounded-3xl border bg-surface",
		children: [
			{
				icon: Settings,
				label: "Editar perfil e fotos",
				key: "edit"
			},
			{
				icon: Shield,
				label: "Privacidade e verificação",
				key: "privacy"
			},
			{
				icon: Crown,
				label: showEarnings ? "Dashboard de ganhos" : "Gerenciar assinatura VIP",
				key: "role"
			},
			{
				icon: ChartNoAxesColumn,
				label: "Estatísticas do perfil",
				key: "stats"
			},
			{
				icon: CircleQuestionMark,
				label: "Suporte HotMatch",
				key: "support"
			}
		].map(({ icon: Icon, label, key }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => onMenu(key),
			className: "flex w-full items-center gap-3 border-b px-4 py-3.5 text-left active:bg-surface-2 last:border-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex-1 text-sm font-medium",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })
			]
		}) }, key))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => {
			actions.signOut();
			toast("Você saiu da conta.");
			navigate({ to: "/bem-vindo" });
		},
		className: "mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full border py-3 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sair da conta"]
	})] });
}
function Stat({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border bg-surface p-3 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mx-auto grid size-8 place-items-center",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base font-extrabold",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] text-muted-foreground",
				children: label
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
