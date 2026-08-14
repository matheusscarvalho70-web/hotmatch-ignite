import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { nitro } from 'nitro/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart(),
    nitro({
      preset: 'vercel',
      renderer: {
        handler: resolve(
          process.cwd(),
          'node_modules/nitro/dist/runtime/internal/vite/ssr-renderer.mjs',
        ),
      },
      experimental: {
        vite: {
          services: {
            ssr: { entry: './src/server.ts' },
          },
        },
      },
    }),
    react(),
  ],
});
