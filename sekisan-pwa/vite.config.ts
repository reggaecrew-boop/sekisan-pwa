import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages (repo: sekisan-pwa)
export default defineConfig({
  plugins: [react()],
  base: "/sekisan-pwa/",
});
