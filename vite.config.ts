import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return
          if (id.includes("scheduler") || id.includes("\\react-dom\\") || id.includes("/react-dom/")) return "vendor-react"
          if (id.includes("@tanstack")) return "vendor-tanstack"
          if (id.includes("msw")) return "vendor-msw"
          if (id.includes("lucide-react")) return "vendor-icons"
          if (id.includes("zod")) return "vendor-zod"
        },
      },
    },
  },
})
