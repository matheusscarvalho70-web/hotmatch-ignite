import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Ao remover a configuração 'tanstackStart' com o 'entry: server', 
  // o projeto deixa de tentar rodar o servidor Node/SSR no Vercel
  // e compila como uma aplicação estática (SPA).
});
