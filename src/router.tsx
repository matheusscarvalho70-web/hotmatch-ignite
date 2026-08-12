import { createRouter as RGR } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = RGR({
    routeTree,
    // suas outras configurações (como scrollRestoration, etc.)
  })

  return router
}

// Se necessário para o tipo do router
export type RegisterRouter = ReturnType<typeof getRouter>
