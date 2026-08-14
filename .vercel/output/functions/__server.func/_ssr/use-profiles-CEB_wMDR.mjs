import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { r as supabase } from "./store-ClKvk3xj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-profiles-CEB_wMDR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** Haversine great-circle distance in km between two lat/lng points. */
function haversineKm(lat1, lng1, lat2, lng2) {
	const R = 6371;
	const toRad = (d) => d * Math.PI / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
/**
* Persist the browser-resolved coordinates back to the profiles row.
* Called by useUserLocation; safe to call multiple times.
*/
async function updateUserLocation(profileId, lat, lng) {
	if (!profileId) return;
	const { error } = await supabase.from("profiles").update({
		latitude: lat,
		longitude: lng
	}).eq("id", profileId);
	if (error) console.warn("[Location] DB update failed:", error.message);
}
var _cachedCoords = null;
/**
* On mount, requests the browser's current position, saves it to the DB, and
* returns it for use in distance-based sorting.
* Triggers when the Discover or Feed tab is opened while the user is logged in.
*/
function useUserLocation(profileId) {
	const [coords, setCoords] = (0, import_react.useState)(_cachedCoords);
	(0, import_react.useEffect)(() => {
		if (!profileId) return;
		if (_cachedCoords) {
			setCoords(_cachedCoords);
			return;
		}
		if (!navigator?.geolocation) return;
		navigator.geolocation.getCurrentPosition((pos) => {
			const lat = pos.coords.latitude;
			const lng = pos.coords.longitude;
			_cachedCoords = {
				lat,
				lng
			};
			setCoords({
				lat,
				lng
			});
			updateUserLocation(profileId, lat, lng).catch(() => {});
		}, (err) => console.warn("[Location] Browser geolocation failed:", err.message), {
			timeout: 1e4,
			enableHighAccuracy: false
		});
	}, [profileId]);
	return coords;
}
/**
* Fetches all profiles once, then sorts them by distance from the user when
* coordinates are available. Profiles without coordinates sort to the end.
*/
function useProfiles(userLat, userLng, excludeIds = []) {
	const [rawProfiles, setRawProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		supabase.from("profiles").select("*").order("created_at", { ascending: true }).then(({ data, error }) => {
			if (!cancelled && !error && data) setRawProfiles(data);
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	return {
		profiles: (0, import_react.useMemo)(() => {
			const filtered = excludeIds.length > 0 ? rawProfiles.filter((p) => !excludeIds.includes(p.id)) : rawProfiles;
			if (userLat == null || userLng == null) return filtered;
			return [...filtered].sort((a, b) => {
				return (a.latitude != null && a.longitude != null ? haversineKm(userLat, userLng, a.latitude, a.longitude) : Infinity) - (b.latitude != null && b.longitude != null ? haversineKm(userLat, userLng, b.latitude, b.longitude) : Infinity);
			});
		}, [
			rawProfiles,
			userLat,
			userLng,
			excludeIds
		]),
		loading
	};
}
function useProfile(id, refreshKey = 0) {
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!id) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		supabase.from("profiles").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
			if (!cancelled && !error) setProfile(data);
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [id, refreshKey]);
	return {
		profile,
		loading
	};
}
function useProfileStats(profileId) {
	const [stats, setStats] = (0, import_react.useState)({
		postCount: 0,
		likesTotal: 0,
		giftsReceived: 0,
		followersCount: 0
	});
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!profileId) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		Promise.all([supabase.from("feed_posts").select("likes", { count: "exact" }).eq("author_id", profileId), supabase.from("chat_messages").select("id", { count: "exact" }).eq("receiver_id", profileId).eq("message_kind", "gift")]).then(([postsRes, giftsRes]) => {
			if (cancelled) return;
			const postCount = postsRes.count ?? 0;
			const likesTotal = (postsRes.data ?? []).reduce((s, p) => s + (p.likes ?? 0), 0);
			const giftsReceived = giftsRes.count ?? 0;
			setStats({
				postCount,
				likesTotal,
				giftsReceived,
				followersCount: 0
			});
			setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [profileId]);
	return {
		stats,
		loading
	};
}
//#endregion
export { useUserLocation as a, useProfiles as i, useProfile as n, useProfileStats as r, haversineKm as t };
