import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

export const worker = setupWorker(...handlers)

export async function enableMocking() {
  // Habilita o MSW em desenvolvimento e na build de demonstração para Vercel
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js"
    }
  })
}
