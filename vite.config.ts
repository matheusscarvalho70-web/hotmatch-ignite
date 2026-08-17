import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackStart(),
    tsconfigPaths(),
  ],
})
