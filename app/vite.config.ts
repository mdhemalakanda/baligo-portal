import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Builds the Baligo SPA into ../assets, where the WordPress plugin enqueues it.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "../assets",
    emptyOutDir: true,
    manifest: false,
    rollupOptions: {
      output: {
        entryFileNames: "js/baligo.js",
        chunkFileNames: "js/[name].js",
        assetFileNames: (info) =>
          info.names?.[0]?.endsWith(".css") ? "css/baligo.css" : "assets/[name][extname]",
      },
    },
  },
});
