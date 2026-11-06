import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
  },
  resolve: {
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  // Components that import a CSS module (the Africa map) are rendered by
  // the figure tests; Vite would otherwise load the project's PostCSS
  // config (the Tailwind plugin), which is not for tests.
  css: { postcss: { plugins: [] } },
});
