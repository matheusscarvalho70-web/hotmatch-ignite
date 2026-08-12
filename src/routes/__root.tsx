import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { registerPushNotifications } from "../lib/firebase";
import { supabase } from "../lib/supabase";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    async function initNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await registerPushNotifications(session.user.id);
        }
      } catch (err) {
        console.error("Erro ao inicializar notificações:", err);
      }
    }
    initNotifications();
  }, []);

  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  );
}
