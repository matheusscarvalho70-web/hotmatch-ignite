import { createRouter as RRCreateRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";

export function createRouter() {
  const queryClient = new QueryClient();

  return RRCreateRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
  });
}
