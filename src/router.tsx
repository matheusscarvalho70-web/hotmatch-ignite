import { createRouter as a } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return a({
    routeTree,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
