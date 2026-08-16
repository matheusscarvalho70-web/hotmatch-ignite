import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import React from "react";
import { Toaster } from "@/components/ui/sonner";

// Componente de segurança para capturar o erro exato na tela do celular
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", background: "#ffe6e6", fontFamily: "monospace", wordBreak: "break-all", zIndex: 99999, position: "relative" }}>
          <h2>Erro Crítico no Client-side:</h2>
          <p>{this.state.error?.toString()}</p>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "HotMatch" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  // Captura erros globais assíncronos ou fora do React
  if (typeof window !== 'undefined') {
    window.onerror = function(message, source, lineno, colno, error) {
      const errorDiv = document.getElementById('global-error-box');
      if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `<h3>Erro Global:</h3><p>${message}</p><small>${source}:${lineno}:${colno}</small>`;
      }
    };
  }

  return (
    <ErrorBoundary>
      <div id="global-error-box" style={{ display: 'none', padding: '20px', color: 'red', background: '#ffe6e6', fontFamily: 'monospace', zIndex: 99999, position: 'relative' }}></div>
      <RootDocument>
        <Outlet />
        <Toaster position="top-center" richColors />
      </RootDocument>
    </ErrorBoundary>
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
