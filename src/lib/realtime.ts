import { io, Socket } from "socket.io-client"
import { mockDb } from "@/mocks/db"

export interface NFTUpdatedPayload {
  nftId: string
  priceEth: string
  stockAvailable: number
  version: number
}

export interface OrderUpdatedPayload {
  orderId: string
  status: "pending" | "confirmed" | "rejected"
  transactionHash?: string
  version: number
}

type EventCallback<T> = (data: T) => void

/**
 * Cliente Socket.IO com fallback simulado em browser para o MSW.
 * Dispara e escuta eventos de `nft.updated` e `order.updated`.
 */
class RealtimeClient {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private connected: boolean = false
  private eventVersions: Map<string, number> = new Map() // Tolerância a eventos antigos/duplicados

  constructor() {
    this.connect()
  }

  public connect() {
    try {
      // Conecta ao endpoint mock via Socket.IO Client real
      this.socket = io(window.location.origin, {
        autoConnect: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      this.socket.on("connect", () => {
        this.connected = true
      })

      this.socket.on("disconnect", () => {
        this.connected = false
      })

      this.socket.on("nft.updated", (data: NFTUpdatedPayload) => {
        this.handleNftUpdated(data)
      })

      this.socket.on("order.updated", (data: OrderUpdatedPayload) => {
        this.handleOrderUpdated(data)
      })
    } catch {
      // Fallback offline se socket falhar
      this.connected = false
    }
  }

  public isConnected(): boolean {
    return this.connected || true // No mock browser sempre consideramos online por conveniência
  }

  // --- Handlers com proteção contra versões antigas e duplicatas ---
  private handleNftUpdated(payload: NFTUpdatedPayload) {
    const key = `nft-${payload.nftId}`
    const lastVersion = this.eventVersions.get(key) || 0
    if (payload.version <= lastVersion) {
      // Descarta evento obsoleto/duplicado
      return
    }
    this.eventVersions.set(key, payload.version)

    // Atualiza o mockDb em tempo real
    mockDb.updateNFT(payload.nftId, {
      priceEth: payload.priceEth,
      stockAvailable: payload.stockAvailable
    })

    this.dispatch("nft.updated", payload)
  }

  private handleOrderUpdated(payload: OrderUpdatedPayload) {
    const key = `order-${payload.orderId}`
    const lastVersion = this.eventVersions.get(key) || 0
    if (payload.version <= lastVersion) {
      return
    }
    this.eventVersions.set(key, payload.version)
    this.dispatch("order.updated", payload)
  }

  // --- Métodos de Assinatura para Componentes React ---
  public on<T>(event: "nft.updated" | "order.updated", callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const set = this.listeners.get(event)!
    set.add(callback)

    // Retorna função de cleanup para o useEffect
    return () => {
      set.delete(callback)
    }
  }

  private dispatch(event: string, data: any) {
    const set = this.listeners.get(event)
    if (set) {
      set.forEach(cb => {
        try { cb(data) } catch (e) { console.error("Error in realtime listener:", e) }
      })
    }
  }

  /**
   * Helper para simular a emissão de eventos a partir do painel de testes/cenários
   */
  public emitMockNftUpdated(nftId: string, newPriceEth: string, newStock: number) {
    const payload: NFTUpdatedPayload = {
      nftId,
      priceEth: newPriceEth,
      stockAvailable: newStock,
      version: (this.eventVersions.get(`nft-${nftId}`) || 0) + 1
    }
    // Emite via socket se conectado, caso contrário processa localmente
    if (this.socket && this.socket.connected) {
      this.socket.emit("nft.updated", payload)
    }
    this.handleNftUpdated(payload)
  }

  public emitMockOrderUpdated(orderId: string, status: "confirmed" | "rejected") {
    const payload: OrderUpdatedPayload = {
      orderId,
      status,
      version: (this.eventVersions.get(`order-${orderId}`) || 0) + 1
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit("order.updated", payload)
    }
    this.handleOrderUpdated(payload)
  }
    this.handleOrderUpdated(payload)
  }
}

export const realtimeClient = new RealtimeClient()
