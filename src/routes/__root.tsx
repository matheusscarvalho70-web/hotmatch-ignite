import { createRootRoute, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import React from "react";
import { Toaster } from "@/components/ui/sonner";

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
        <div style={{ padding: "20px", color: "red", background: "#ffe6e6", fontFamily: "monospace", wordBreak: "break-all" }}>
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
  component: RootComponent,
});

function RootComponent() {
  return (
    <ErrorBoundary>
      <Outlet />
      <Toaster position="top-center" richColors />
    </ErrorBoundary>
  );
}
