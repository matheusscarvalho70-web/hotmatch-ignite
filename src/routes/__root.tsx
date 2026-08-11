import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/hotmatch/BottomNav";
import { useSessionBootstrap } from "@/hooks/use-profiles";
import { useAppState, refreshUnreadUsersCount } from "@/lib/hotmatch/store";
import { initOneSignal } from "@/lib/hotmatch/onesignal";
import { supabase } from "@/lib/supabase";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O conteúdo que você procura não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-hot px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-hot"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-full bg-gradient-hot px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-hot"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { name: "theme-color", content: "#0B0B0E" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
        {/* OneSignal Web Push SDK */}
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = /^\/mensagens\/.+/.test(pathname) || pathname.startsWith("/bem-vindo");

  const { profileId } = useAppState();

  // Bootstrap session from DB on every app load
  useSessionBootstrap();

  // Initialize OneSignal Web Push (idempotent — safe on every render)
  useEffect(() => { initOneSignal(); }, []);

  // Sincronização global em tempo real e verificação periódica
  useEffect(() => {
    if (!profileId) return;

    // Busca inicial ao carregar
    refreshUnreadUsersCount();

    // Verificação de segurança a cada 5 segundos
    const interval = setInterval(() => {
      refreshUnreadUsersCount();
    }, 5000);

    const channel = supabase
      .channel(`global-root-unread-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `receiver_id=eq.${profileId}`,
        },
        () => {
          refreshUnreadUsersCount();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative mx-auto min-h-screen w-full max-w-[30rem] overflow-x-hidden bg-background">
        <AuthGuard />
        <Outlet />
        {!hideNav && <BottomNav />}
      </div>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

/** Redirects unauthenticated users to /bem-vindo on every protected route. */
function AuthGuard() {
  const { profileId } = useAppState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const publicPaths = ["/bem-vindo"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isPublic && !profileId) {
      navigate({ to: "/bem-vindo", replace: true });
    }
  }, [profileId, isPublic, pathname, navigate]);

  return null;
                                   }
