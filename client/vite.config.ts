import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    // This tells Vite to bundle `class-variance-authority` directly into
    // the server build instead of trying to import it externally.
    // This is the primary fix for the 'VariantProps' error.
    noExternal: ["class-variance-authority"],
  },
});
