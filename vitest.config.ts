import path from "node:path";

import { defineConfig } from "vitest/config";

/**
 * Config mínima: só lógica pura (máquina de estados, formatters) é testada
 * por ora — sem DOM/Testing Library ainda. Alias `@/*` replicado manualmente
 * a partir do `tsconfig.json` (sem plugin extra para isso).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
  },
});
