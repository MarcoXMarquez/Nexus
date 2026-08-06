import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname),
  base: "./",
  publicDir: path.resolve(__dirname, "../public"),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "../desktop-dist/renderer"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
