import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "index.ts"),
        components: resolve(__dirname, "components/index.ts"),
        blueprints: resolve(__dirname, "components/blueprints/index.ts"),
        hooks: resolve(__dirname, "hooks/index.ts"),
        services: resolve(__dirname, "services/index.ts"),
        types: resolve(__dirname, "types/index.ts"),
      },
      name: "FlyingFoxSDK",
      fileName: (format, entryName) => `${entryName}/index.${format}.js`,
      formats: ["es"],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        assetFileNames: "sdk.css",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@ffx": resolve(__dirname, "."),
    },
  },
});
