// Vitest config — Next.js 15 + React 19 + TypeScript.
// Coverage gate: 80% on src/lib/ (per /plan-eng-review #3B locked discipline).

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Gate per plan: 80% minimum on src/lib/. Higher targets enforced in
      // package-level files via per-file thresholds when those land.
      thresholds: {
        "src/lib/**": {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
      exclude: [
        "**/*.config.{ts,js,mjs}",
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/types.ts", // pure types, no runtime
        "src/app/**", // Next.js routes covered by Playwright E2E
        "extension/**",
        "scripts/**", // generation orchestrator covered separately
        // Thin I/O wrappers over external systems, exercised by E2E not unit tests:
        "src/lib/pdf.ts", // wraps unpdf (PDF text extraction)
        "src/lib/file-cache.ts", // wraps browser IndexedDB
        "src/lib/local-claude.ts", // dev-only: spawns the local `claude` CLI subprocess
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
