import { supabase } from "@/lib/supabase";

const APP_ID = "f44f0fc5-bd84-4d56-a7e8-38b7d9cf1b68";

// Minimal typings for the OneSignal v16 page SDK (loaded via CDN script tag)
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalPageSDK) => void | Promise<void>>;
  }
}

interface OneSignalPageSDK {
  init(options: {
    appId: string;
    allowLocalhostAsSecureOrigin?: boolean;
    notifyButton?: { enable: boolean };
    [key: string]: unknown;
  }): Promise<void>;
  /** Associate the current device/subscription with an external user identity.
   *  Call immediately after successful Supabase Auth sign-in so push notifications
   *  can be targeted by Supabase user ID on the OneSignal dashboard. */
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  Notifications: {
    requestPermission(): Promise<void>;
    permissionNative: NotificationPermission;
  };
  User: {
    PushSubscription: {
      id: string | null | undefined;
      optedIn: boolean;
    };
  };
}

/**
 * Associate the authenticated Supabase user ID with the OneSignal push subscription.
 * Call this immediately after every successful sign-in so the OneSignal dashboard can
 * target push notifications by Supabase user ID.
 */
export function loginOneSignal(userId: string): void {
  if (typeof window === "undefined") return;
  const deferred = window.OneSignalDeferred;
  if (!deferred) return;
  deferred.push(async (OneSignal) => {
    try {
      await OneSignal.login(userId);
    } catch (e) {
      console.warn("[OneSignal] login() failed:", e);
    }
  });
}

/** Call once, early in the app lifecycle (e.g. in a root useEffect). */
export function initOneSignal(): void {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
    });
  });
}

/**
 * Request push notification permission, then persist the subscription ID
 * to the user's profiles row. Safe to call multiple times — re-saves if the
 * ID changed.
 */
export async function registerPush(profileId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const deferred = window.OneSignalDeferred;
  if (!deferred) return;

  await new Promise<void>((resolve) => {
    deferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
      } catch {
        // User dismissed — not a fatal error
      }

      const subId = OneSignal.User?.PushSubscription?.id;
      if (subId) {
        const { error } = await supabase
          .from("profiles")
          .update({ onesignal_player_id: subId })
          .eq("id", profileId);
        if (error) {
          console.warn("[OneSignal] Failed to save player ID:", error.message);
        } else {
          console.log("[OneSignal] Saved player ID:", subId);
        }
      }
      resolve();
    });
  });
}
