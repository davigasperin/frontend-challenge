import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { enableMocking } from "./mocks/browser"
import { mockDb } from "./mocks/db"

// Exposição do mockDb para testes E2E determinísticos via Playwright
if (typeof window !== "undefined") {
  (window as any).__mockDb = mockDb
}

async function bootstrap() {
  await enableMocking()

  const rootElement = document.getElementById("root")
  if (!rootElement) throw new Error("Failed to find root element")

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

bootstrap().catch(console.error)

