// ============================================================================
// Vite config — content script ONLY
// ============================================================================
// Chrome MV3 content scripts are injected as classic scripts, not ES modules,
// so they must be bundled into a single self-contained file with no `import`
// statements. The main vite.config.ts builds everything else as ES modules
// (popup, portal, background service worker), and this second pass bundles
// the content script as one IIFE with every dependency inlined.
//
// `emptyOutDir: false` is critical — without it this build would wipe the
// dist/ folder produced by the main build.
// ============================================================================

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: "dist",
    target: "es2020",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
      },
      mangle: {
        reserved: ["chrome"],
      },
    },
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, "src/content/contentScript.ts"),
      },
      output: {
        format: "iife",
        // Force every dependency into the same file — no chunk imports.
        inlineDynamicImports: true,
        entryFileNames: "content/contentScript.js",
        // No chunks should be emitted for an IIFE, but set the pattern
        // defensively in case Rollup decides to create one.
        chunkFileNames: "content/[name].js",
        assetFileNames: "content/[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@apps": resolve(__dirname, "src/apps"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@utils": resolve(__dirname, "src/utils"),
      "@components": resolve(__dirname, "src/components"),
      "@shared": resolve(__dirname, "src/components/shared"),
    },
  },
});
