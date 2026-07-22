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
      // O pacote `server-only` lança erro por padrão (`exports.default`);
      // só vira no-op sob a condição `react-server`, que o bundler do Next
      // aplica mas o Vitest não. Sem isso, todo módulo `import "server-only"`
      // (repositories/services/lib) quebraria ao ser importado num teste.
      "server-only": path.resolve(
        __dirname,
        "node_modules/server-only/empty.js",
      ),
    },
  },
  test: {
    environment: "node",
  },
});
