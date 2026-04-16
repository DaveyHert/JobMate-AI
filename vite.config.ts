import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        popup: resolve(__dirname, "popup.html"),
        portal: resolve(__dirname, "portal.html"),
        onboarding: resolve(__dirname, "onboarding.html"),
        background: resolve(__dirname, "src/background/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background/[name].js";
          }
          if (chunkInfo.name === "popup") {
            return "popup.js";
          }
          if (chunkInfo.name === "portal") {
            return "portal.js";
          }
          if (chunkInfo.name === "onboarding") {
            return "onboarding.js";
          }
          return "[name].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        format: "es",
      },
    },
    sourcemap: process.env.NODE_ENV === "development",
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
    outDir: "dist",
    target: "es2020",
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
  optimizeDeps: {
    include: ["lucide-react", "react", "react-dom"],
    exclude: [],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  esbuild: {
    target: "es2020",
    format: "esm",
  },
});
