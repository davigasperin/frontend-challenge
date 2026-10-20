import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

// shortcut: socketIoMock (WebSocketLink) não é compatível com o tipo AnyHandler do setupWorker, remover cast quando o MSW tipar links WebSocket
export const worker = setupWorker(...(handlers as any))

export async function enableMocking() {
  // Habilita o MSW em desenvolvimento e na build de demonstração para Vercel
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js"
    }
  })
}
