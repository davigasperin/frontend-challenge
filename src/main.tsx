import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { enableMocking } from "./mocks/browser"

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

