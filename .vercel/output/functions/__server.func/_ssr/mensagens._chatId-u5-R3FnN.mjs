import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useAppState, r as supabase, t as actions } from "./store-ClKvk3xj.mjs";
import { b as useParams, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { C as Pause, I as EllipsisVertical, N as Gift, P as Flag, Q as ArrowLeft, R as Coins, S as Play, X as Ban, _ as Send, i as X, j as ImagePlus, w as Mic } from "../_libs/lucide-react.mjs";
import { i as useProfiles } from "./use-profiles-CEB_wMDR.mjs";
import { n as gifts } from "./data-CU6bcBgF.mjs";
import { t as Lightbox } from "./Lightbox-DdL36lPv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mensagens._chatId-u5-R3FnN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toLocal(msg, myId) {
	const from = msg.sender_id === myId ? "me" : "them";
	const time = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit"
	});
	const kind = msg.message_kind ?? "text";
	return {
		id: msg.id,
		from,
		kind,
		text: msg.content ?? void 0,
		media: msg.media_url ?? void 0,
		seconds: msg.audio_seconds ?? void 0,
		price: msg.unlock_price && msg.unlock_price > 0 ? msg.unlock_price : void 0,
		time
	};
}
function useChat({ partnerId, partnerName, isDemo }) {
	const { profileId } = useAppState();
	const storeMyId = profileId ?? "";
	const [partnerUuid, setPartnerUuid] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const channelRef = (0, import_react.useRef)(null);
	const myId = storeMyId || "7f56165e-1173-40df-bc95-d2cdb59a2399";
	(0, import_react.useEffect)(() => {
		if (!partnerId) {
			setPartnerUuid(null);
			return;
		}
		setPartnerUuid(partnerId);
	}, [partnerId]);
	(0, import_react.useEffect)(() => {
		if (!myId || !partnerUuid) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		(async () => {
			try {
				const { data, error } = await supabase.from("chat_messages").select("*").or(`and(sender_id.eq.${myId},receiver_id.eq.${partnerUuid}),and(sender_id.eq.${partnerUuid},receiver_id.eq.${myId})`).order("created_at", { ascending: true }).limit(100);
				if (!cancelled) {
					if (!error && data) setMessages(data.map((m) => toLocal(m, myId)));
					setLoading(false);
				}
			} catch {
				if (!cancelled) setLoading(false);
			}
		})();
		const channel = supabase.channel(`chat_${[myId, partnerUuid].sort().join("_")}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "chat_messages"
		}, (payload) => {
			const msg = payload.new;
			if ((msg.sender_id === myId && msg.receiver_id === partnerUuid || msg.sender_id === partnerUuid && msg.receiver_id === myId) && !cancelled) setMessages((prev) => {
				if (prev.some((m) => m.id === msg.id)) return prev;
				return [...prev, toLocal(msg, myId)];
			});
		}).subscribe();
		channelRef.current = channel;
		return () => {
			cancelled = true;
			supabase.removeChannel(channel);
			channelRef.current = null;
		};
	}, [myId, partnerUuid]);
	async function sendMessage(text, kind = "text") {
		if (!partnerUuid) {
			toast.error("Destinatário inválido.");
			return;
		}
		try {
			const insertPayload = {
				sender_id: myId,
				receiver_id: partnerUuid,
				content: text,
				message_kind: kind
			};
			const { data, error } = await supabase.from("chat_messages").insert(insertPayload).select().single();
			if (error) throw error;
			if (data) {
				const local = toLocal(data, myId);
				setMessages((prev) => {
					if (prev.some((m) => m.id === local.id)) return prev;
					return [...prev, local];
				});
			}
			notifyPartner(partnerUuid, "Nova mensagem!", text);
		} catch (err) {
			console.error("Erro ao enviar mensagem:", err);
		}
	}
	async function sendAudioMessage(mediaUrl, seconds) {
		if (!partnerUuid) return;
		try {
			const insertPayload = {
				sender_id: myId,
				receiver_id: partnerUuid,
				media_url: mediaUrl,
				audio_seconds: seconds,
				message_kind: "audio",
				content: `Áudio (${seconds}s)`
			};
			const { data, error } = await supabase.from("chat_messages").insert(insertPayload).select().single();
			if (error) throw error;
			if (data) {
				const local = toLocal(data, myId);
				setMessages((prev) => {
					if (prev.some((m) => m.id === local.id)) return prev;
					return [...prev, local];
				});
			}
			notifyPartner(partnerUuid, "🎤 Áudio recebido", "Novo áudio para você");
		} catch (err) {
			console.error("Erro ao enviar áudio:", err);
		}
	}
	async function sendGiftMessage(emoji, name, price) {
		if (!partnerUuid) return;
		try {
			const insertPayload = {
				sender_id: myId,
				receiver_id: partnerUuid,
				content: `${emoji} ${name}`,
				message_kind: "gift",
				unlock_price: price
			};
			const { data, error } = await supabase.from("chat_messages").insert(insertPayload).select().single();
			if (error) throw error;
			if (data) {
				const local = toLocal(data, myId);
				setMessages((prev) => {
					if (prev.some((m) => m.id === local.id)) return prev;
					return [...prev, local];
				});
			}
			notifyPartner(partnerUuid, `${emoji} Mimo recebido`, `Você ganhou: ${name}`);
		} catch (err) {
			console.error("Erro ao enviar mimo:", err);
		}
	}
	async function sendMediaMessage(mediaUrl, mediaType) {
		if (!partnerUuid) return;
		try {
			const insertPayload = {
				sender_id: myId,
				receiver_id: partnerUuid,
				media_url: mediaUrl,
				message_kind: "media",
				content: mediaType === "foto" ? "📷 Foto" : "🎬 Vídeo"
			};
			const { data, error } = await supabase.from("chat_messages").insert(insertPayload).select().single();
			if (error) throw error;
			if (data) {
				const local = toLocal(data, myId);
				setMessages((prev) => {
					if (prev.some((m) => m.id === local.id)) return prev;
					return [...prev, local];
				});
			}
			notifyPartner(partnerUuid, "📷 Mídia recebida", "Nova mídia para você");
		} catch (err) {
			console.error("Erro ao enviar mídia:", err);
		}
	}
	return {
		messages,
		loading,
		sendMessage,
		sendAudioMessage,
		sendGiftMessage,
		sendMediaMessage,
		myId,
		partnerName,
		isDemo
	};
}
async function notifyPartner(receiverId, title, body) {
	try {
		supabase.from("notifications").insert({
			user_id: receiverId,
			type: "message",
			title,
			content: body,
			is_read: false
		}).then(({ error }) => {
			if (error) console.warn("[Chat] notification insert failed:", error);
		});
		const { data } = await supabase.from("profiles").select("onesignal_player_id").eq("id", receiverId).maybeSingle();
		if (!data?.onesignal_player_id) return;
		await supabase.functions.invoke("notify-user", { body: {
			player_id: data.onesignal_player_id,
			title,
			message: body
		} });
	} catch (e) {
		console.warn("[Push] notifyPartner failed:", e);
	}
}
function ChatRoute() {
	const { chatId } = useParams({ from: "/mensagens/$chatId" });
	const navigate = useNavigate();
	const { profileId, coins } = useAppState();
	const partnerId = chatId;
	const { profiles: dbProfiles } = useProfiles();
	const dbPartner = dbProfiles.find((p) => p.id === partnerId);
	const partnerName = dbPartner?.name ?? "Conversa";
	const partnerAvatar = dbPartner?.avatar_url ?? null;
	const { messages, sendMessage, sendAudioMessage, sendGiftMessage, sendMediaMessage } = useChat({
		partnerId,
		partnerName,
		isDemo: dbPartner?.is_demo
	});
	const [inputText, setInputText] = (0, import_react.useState)("");
	const [showGiftModal, setShowGiftModal] = (0, import_react.useState)(false);
	const [showMenu, setShowMenu] = (0, import_react.useState)(false);
	const [showReport, setShowReport] = (0, import_react.useState)(false);
	const [lightboxImage, setLightboxImage] = (0, import_react.useState)(null);
	const [isRecording, setIsRecording] = (0, import_react.useState)(false);
	const [audioTimer, setAudioTimer] = (0, import_react.useState)(0);
	const audioIntervalRef = (0, import_react.useRef)(null);
	const mediaRecorderRef = (0, import_react.useRef)(null);
	const audioChunksRef = (0, import_react.useRef)([]);
	const audioSecondsRef = (0, import_react.useRef)(0);
	const fileInputRef = (0, import_react.useRef)(null);
	const messagesEndRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!profileId || !partnerId) return;
		async function markConversationAsRead() {
			try {
				await supabase.from("chat_messages").update({ is_read: true }).eq("receiver_id", profileId).eq("sender_id", partnerId).eq("is_read", false);
				await supabase.from("notifications").update({ is_read: true }).eq("user_id", profileId).eq("type", "message").eq("is_read", false);
			} catch (err) {
				console.error("Erro ao marcar conversas como lidas:", err);
			}
		}
		markConversationAsRead();
	}, [
		profileId,
		partnerId,
		messages
	]);
	(0, import_react.useEffect)(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);
	const handleSend = async () => {
		if (!inputText.trim()) return;
		sendMessage(inputText, "text");
		setInputText("");
	};
	const handleSendGift = (gift) => {
		setShowGiftModal(false);
		if (coins < gift.price) {
			toast.error(`Saldo insuficiente. Você precisa de ${gift.price} moedas.`);
			return;
		}
		sendGiftMessage(gift.emoji, gift.name, gift.price);
		actions.spendCoins(gift.price);
		toast.success(`Você enviou ${gift.name}!`);
	};
	const handleMediaSelect = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const isVideo = file.type.startsWith("video/");
		const isImage = file.type.startsWith("image/");
		if (!isVideo && !isImage) {
			toast.error("Selecione uma imagem ou vídeo.");
			return;
		}
		toast.loading("Enviando mídia...", { id: "media-upload" });
		try {
			const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
			const fileName = `media_${Date.now()}.${ext}`;
			const folder = isVideo ? "chat-video" : "chat-photo";
			const { error: uploadError } = await supabase.storage.from("chat-media").upload(`${folder}/${fileName}`, file, { contentType: file.type });
			if (uploadError) throw uploadError;
			const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(`${folder}/${fileName}`);
			await sendMediaMessage(urlData.publicUrl, isVideo ? "vídeo" : "foto");
			toast.success("Mídia enviada!", { id: "media-upload" });
		} catch (err) {
			toast.error("Erro ao enviar mídia.", { id: "media-upload" });
			console.error(err);
		} finally {
			e.target.value = "";
		}
	};
	const startAudioRecord = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
			const recorder = new MediaRecorder(stream, { mimeType });
			audioChunksRef.current = [];
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) audioChunksRef.current.push(e.data);
			};
			recorder.onstop = async () => {
				stream.getTracks().forEach((t) => t.stop());
				const blob = new Blob(audioChunksRef.current, { type: mimeType });
				const seconds = audioSecondsRef.current;
				if (blob.size > 0 && seconds > 0) {
					toast.loading("Enviando áudio...", { id: "audio-upload" });
					try {
						const fileName = `audio_${Date.now()}.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
						const { error: uploadError } = await supabase.storage.from("chat-media").upload(`chat-audio/${fileName}`, blob, { contentType: mimeType });
						if (uploadError) throw uploadError;
						const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(`chat-audio/${fileName}`);
						await sendAudioMessage(urlData.publicUrl, seconds);
						toast.success("Áudio enviado!", { id: "audio-upload" });
					} catch (err) {
						toast.error("Erro ao enviar áudio.", { id: "audio-upload" });
						console.error(err);
					}
				}
			};
			recorder.start();
			mediaRecorderRef.current = recorder;
			setIsRecording(true);
			setAudioTimer(0);
			audioSecondsRef.current = 0;
			audioIntervalRef.current = setInterval(() => {
				audioSecondsRef.current += 1;
				setAudioTimer(audioSecondsRef.current);
			}, 1e3);
		} catch (err) {
			toast.error("Não foi possível acessar o microfone.");
			console.error(err);
		}
	};
	const stopAudioRecord = () => {
		if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
		setIsRecording(false);
		setAudioTimer(0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-[100dvh] bg-[#0B0B0E] text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 bg-[#121218]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/mensagens",
						className: "text-white/70 hover:text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-6 h-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({
							to: "/perfil",
							search: {
								uid: partnerId,
								from: chatId
							}
						}),
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
								alt: partnerName,
								className: "w-10 h-10 rounded-full object-cover border border-[#FFD700]/30"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0B0E]" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold text-sm leading-tight text-white",
								children: partnerName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-green-400 font-medium",
								children: "Online agora"
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-white/80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowGiftModal(true),
							className: "p-2 hover:bg-white/5 rounded-full transition",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "w-5 h-5 text-[#FFD700]" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowMenu((v) => !v),
							className: "p-2 hover:bg-white/5 rounded-full transition",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "w-5 h-5" })
						}),
						showMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute right-4 top-14 z-40 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C24] shadow-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setShowMenu(false);
									toast.success("Usuário bloqueado.");
								},
								className: "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "w-4 h-4 text-red-400" }), " Bloquear"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setShowMenu(false);
									setShowReport(true);
								},
								className: "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 border-t border-white/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "w-4 h-4 text-orange-400" }), " Denunciar"]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto p-4 space-y-4",
				children: [messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
					msg,
					onImageClick: setLightboxImage
				}, msg.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messagesEndRef })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 bg-[#121218] border-t border-white/10 sticky bottom-0 z-20",
				children: isRecording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between bg-[#1C1C24] px-4 py-3 rounded-full border border-red-500/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm font-medium text-red-400",
						children: [
							"Gravando áudio... ",
							audioTimer,
							"s"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: stopAudioRecord,
						className: "bg-[#FFD700] text-black px-4 py-1.5 rounded-full text-xs font-bold",
						children: "Enviar"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => fileInputRef.current?.click(),
							className: "p-2.5 text-[#FFD700] hover:bg-white/5 rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "w-5 h-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInputRef,
							type: "file",
							accept: "image/*,video/*",
							onChange: handleMediaSelect,
							className: "hidden"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: startAudioRecord,
							className: "p-2.5 text-white/70 hover:text-white rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "w-5 h-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: inputText,
							onChange: (e) => setInputText(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && handleSend(),
							placeholder: "Digite sua mensagem...",
							className: "flex-1 bg-[#1C1C24] text-white placeholder-white/40 text-sm px-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-[#FFD700]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleSend,
							className: "p-2.5 bg-[#FFD700] text-black rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "w-5 h-5" })
						})
					]
				})
			}),
			showGiftModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 bg-black/80 z-50 flex items-end justify-center",
				onClick: () => setShowGiftModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[#121218] w-full max-w-lg rounded-t-3xl p-6 border-t border-white/10 space-y-4",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-bold text-[#FFD700]",
							children: "Enviar Presente"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowGiftModal(false),
							className: "text-white/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-6 h-6" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-3",
						children: gifts.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => handleSendGift(g),
							className: "bg-[#1C1C24] border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl",
									children: g.emoji
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									children: g.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] text-[#FFD700] font-bold flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "w-3 h-3" }),
										" ",
										g.price
									]
								})
							]
						}, g.id))
					})]
				})
			}),
			lightboxImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
				src: lightboxImage,
				onClose: () => setLightboxImage(null)
			})
		]
	});
}
function MessageBubble({ msg, onImageClick }) {
	const isMe = msg.from === "me";
	const audioRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const togglePlay = () => {
		const el = audioRef.current;
		if (!el) return;
		if (playing) {
			el.pause();
			setPlaying(false);
		} else {
			el.play();
			setPlaying(true);
		}
	};
	(0, import_react.useEffect)(() => {
		const el = audioRef.current;
		if (!el) return;
		const onTimeUpdate = () => {
			if (el.duration > 0) setProgress(el.currentTime / el.duration * 100);
		};
		const onEnded = () => {
			setPlaying(false);
			setProgress(0);
		};
		el.addEventListener("timeupdate", onTimeUpdate);
		el.addEventListener("ended", onEnded);
		return () => {
			el.removeEventListener("timeupdate", onTimeUpdate);
			el.removeEventListener("ended", onEnded);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex ${isMe ? "justify-end" : "justify-start"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-[#FFD700] text-black font-medium" : "bg-[#1C1C24] text-white border border-white/5"}`,
			children: msg.kind === "audio" && msg.media ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 min-w-[160px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: togglePlay,
						className: `w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-black text-[#FFD700]" : "bg-[#FFD700] text-black"}`,
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 ml-0.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 space-y-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 w-full bg-white/20 rounded-full overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-full ${isMe ? "bg-black" : "bg-[#FFD700]"}`,
								style: { width: `${progress}%` }
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
						ref: audioRef,
						src: msg.media,
						preload: "metadata"
					})
				]
			}) : msg.kind === "foto" && msg.media ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 cursor-pointer",
				onClick: () => onImageClick?.(msg.media),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: msg.media,
					alt: "Foto",
					className: "rounded-xl max-w-xs object-cover max-h-60"
				}), msg.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-1",
					children: msg.text
				})]
			}) : msg.kind === "gift" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center space-y-1 py-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-3xl block",
					children: msg.media || "🎁"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-bold text-xs",
					children: msg.text
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-wrap break-words",
				children: msg.text
			})
		})
	});
}
//#endregion
export { ChatRoute as component };
