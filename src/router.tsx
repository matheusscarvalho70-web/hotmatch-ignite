import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initOneSignal } from "@/lib/hotmatch/onesignal";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Inicializa o OneSignal globalmente assim que o router é construído
  if (typeof window !== "undefined") {
    initOneSignal();
  }

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
