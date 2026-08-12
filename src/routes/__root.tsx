import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif", color: "red" }}>
        <h2>Ops! Ocorreu um erro ao carregar o app:</h2>
        <pre>{error.message}</pre>
      </div>
    );
  },
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  );
}
