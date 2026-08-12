import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>HotMatch</title>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  );
}
