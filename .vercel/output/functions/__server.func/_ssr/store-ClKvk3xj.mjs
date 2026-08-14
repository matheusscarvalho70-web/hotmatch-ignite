import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-ClKvk3xj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var supabase = createClient("https://ugktawqajqbasqsvtaxl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3Rhd3FhanFiYXNxc3Z0YXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg4NjcsImV4cCI6MjEwMTYxNDg2N30.TMGs1v-Yg6qXJ3CiUzc6ngyCeZB98apYoNyOfNzurqw", { auth: {
	persistSession: true,
	autoRefreshToken: true,
	detectSessionInUrl: true
} });
var STORAGE_KEY = "hm_session_v3";
function loadFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function persist(s) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			profileId: s.profileId,
			gender: s.gender,
			role: s.role,
			name: s.name,
			avatarUrl: s.avatarUrl,
			coins: s.coins,
			earnings: s.earnings,
			xp: s.xp,
			level: s.level,
			vip: s.vip
		}));
	} catch {}
}
var defaultState = {
	profileId: null,
	gender: "male",
	role: "buyer",
	name: "",
	avatarUrl: null,
	coins: 0,
	earnings: 0,
	xp: 0,
	level: "bronze",
	unlocked: [],
	vip: false,
	followed: [],
	galleryUnlocks: [],
	unreadUsersCount: 0
};
var persisted = loadFromStorage();
var state = {
	...defaultState,
	...persisted,
	unlocked: [],
	followed: [],
	galleryUnlocks: [],
	unreadUsersCount: 0
};
var listeners = /* @__PURE__ */ new Set();
var emit = () => listeners.forEach((l) => l());
function subscribe(cb) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}
function getSnapshot() {
	return state;
}
function useAppState() {
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
}
async function refreshUnreadUsersCount() {
	const currentId = state.profileId;
	if (!currentId) {
		if (state.unreadUsersCount !== 0) {
			state = {
				...state,
				unreadUsersCount: 0
			};
			emit();
		}
		return;
	}
	try {
		const { data, error } = await supabase.from("chat_messages").select("sender_id").eq("receiver_id", currentId).eq("is_read", false);
		if (!error && data) {
			const uniqueUsers = new Set(data.map((msg) => msg.sender_id)).size;
			if (state.unreadUsersCount !== uniqueUsers) {
				state = {
					...state,
					unreadUsersCount: uniqueUsers
				};
				emit();
			}
		}
	} catch (err) {
		console.warn("Erro ao buscar contagem global:", err);
	}
}
var actions = {
	setProfile(p) {
		state = {
			...state,
			profileId: p.profileId,
			gender: p.gender,
			role: p.gender === "female" ? "creator" : "buyer",
			name: p.name,
			avatarUrl: p.avatarUrl,
			coins: p.coins,
			earnings: p.earnings,
			xp: p.xp ?? state.xp,
			level: p.level ?? state.level,
			vip: p.vip ?? false
		};
		persist(state);
		emit();
		refreshUnreadUsersCount();
	},
	setGender(gender) {
		state = {
			...state,
			gender,
			role: gender === "female" ? "creator" : "buyer"
		};
		persist(state);
		emit();
	},
	addCoins(amount) {
		state = {
			...state,
			coins: state.coins + amount
		};
		persist(state);
		emit();
	},
	spendCoins(amount) {
		if (state.coins < amount) return false;
		state = {
			...state,
			coins: state.coins - amount
		};
		persist(state);
		emit();
		return true;
	},
	unlock(id, price) {
		if (state.unlocked.includes(id)) return true;
		if (state.coins < price) return false;
		state = {
			...state,
			coins: state.coins - price,
			unlocked: [...state.unlocked, id]
		};
		persist(state);
		emit();
		return true;
	},
	toggleRole() {
		state = {
			...state,
			role: state.role === "buyer" ? "creator" : "buyer"
		};
		emit();
	},
	activateVip() {
		state = {
			...state,
			vip: true
		};
		persist(state);
		emit();
	},
	withdraw(amount) {
		state = {
			...state,
			earnings: Math.max(0, state.earnings - amount)
		};
		persist(state);
		emit();
	},
	follow(profileId) {
		if (state.followed.includes(profileId)) return;
		state = {
			...state,
			followed: [...state.followed, profileId]
		};
		emit();
	},
	unfollow(profileId) {
		state = {
			...state,
			followed: state.followed.filter((id) => id !== profileId)
		};
		emit();
	},
	unlockGallery(creatorId, price) {
		if (state.galleryUnlocks.includes(creatorId)) return true;
		if (state.coins < price) return false;
		state = {
			...state,
			coins: state.coins - price,
			galleryUnlocks: [...state.galleryUnlocks, creatorId]
		};
		persist(state);
		emit();
		return true;
	},
	setGalleryUnlocks(ids) {
		state = {
			...state,
			galleryUnlocks: ids
		};
		emit();
	},
	setUnreadUsersCount(count) {
		if (state.unreadUsersCount === count) return;
		state = {
			...state,
			unreadUsersCount: count
		};
		emit();
	},
	signOut() {
		state = {
			...defaultState,
			unlocked: [],
			followed: [],
			galleryUnlocks: [],
			unreadUsersCount: 0
		};
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {}
		emit();
	}
};
var formatBRL = (v) => v.toLocaleString("pt-BR", {
	style: "currency",
	currency: "BRL"
});
//#endregion
export { useAppState as i, formatBRL as n, supabase as r, actions as t };
