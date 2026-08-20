import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built site works from a subfolder
// (GitHub Pages project sites, an intranet folder, or a USB stick).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "dist", sourcemap: false },
});
