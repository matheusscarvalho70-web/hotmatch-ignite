import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { supabase } from "@/lib/supabase";

const firebaseConfig = {
  apiKey: "AIzaSyBIP8SwNJRYMTuwwRM_C7KBFy6qKSsPgsk",
  authDomain: "hotmatch.firebaseapp.com",
  projectId: "hotmatch",
  storageBucket: "hotmatch.firebasestorage.app",
  messagingSenderId: "506499959092",
  appId: "1:506499959092:web:d0672785e9140b12153d61",
  measurementId: "G-HRRKSHQZ5L"
};

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export async function registerPushNotifications(profileId: string) {
  try {
    if (!messaging || !("Notification" in window)) return;
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BAgDdw0ELlmoJ8ybVZXl9nnXYp1hQ8G7n-LRW6RhuN_qXyiXRW-TRpyUjSe36Y6FfZ9TQ3QR6g0GowfFCCW81bc"
      });

      if (token && profileId) {
        await supabase
          .from("profiles")
          .update({ fcm_token: token })
          .eq("id", profileId);
        
        console.log("Token FCM registrado com sucesso!");
      }
    }
  } catch (error) {
    console.error("Erro ao registrar notificações:", error);
  }
}
