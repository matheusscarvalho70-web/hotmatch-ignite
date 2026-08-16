import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "HotMatch" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <div>Página não encontrada</div>,
  errorComponent: ({ error }) => (
    <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
      <h2>Ocorreu um erro na aplicação:</h2>
      <pre>{error.message}</pre>
    </div>
  ),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Toaster position="top-center" richColors />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
