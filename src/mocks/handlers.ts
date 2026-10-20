import { http, HttpResponse, delay, ws } from "msw"
import { toSocketIo } from "@mswjs/socket.io-binding"
import { mockDb } from "./db"

// Conexão WebSocket interceptada com binding Socket.IO oficial do MSW
export const socketIoMock = ws.link(
  typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`
    : "ws://localhost:3000"
)

const activeSocketIoClients = new Set<any>()

socketIoMock.addEventListener("connection", (connection) => {
  const { client } = toSocketIo(connection)
  activeSocketIoClients.add(client)

  client.on("ping", () => {
    client.emit("pong", Date.now())
  })
})

export function broadcastSocketIoEvent(event: string, payload: unknown) {
  activeSocketIoClients.forEach((client) => {
    try {
      client.emit(event, payload)
    } catch {
      activeSocketIoClients.delete(client)
    }
  })
}

async function applyScenarioMiddlewares() {
  const { scenarios } = mockDb.getState()
  if (scenarios.latencyMs > 0) {
    await delay(scenarios.latencyMs)
  }
  if (scenarios.failRate > 0 && Math.random() < scenarios.failRate) {
    return HttpResponse.json(
      { message: "Falha transitória simulada pelo painel de testes." },
      { status: 500 }
    )
  }
  return null
}

export const handlers = [
  socketIoMock,
  // --- Cenários e Configurações ---
  http.get("/api/scenarios", async () => {
    return HttpResponse.json(mockDb.getState().scenarios)
  }),

  http.post("/api/scenarios", async ({ request }) => {
    const body = (await request.json()) as any
    mockDb.updateScenarios(body)
    return HttpResponse.json(mockDb.getState().scenarios)
  }),

  http.post("/api/scenarios/reset", async () => {
    mockDb.resetToKnownState()
    return HttpResponse.json({ success: true, message: "Banco mock restaurado para o estado inicial." })
  }),

  // --- Auth & Sessão ---
  http.get("/api/auth/me", async () => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const { scenarios } = mockDb.getState()
    if (scenarios.simulateExpiredSession) {
      return HttpResponse.json({ message: "Sessão expirada." }, { status: 401 })
    }

    const user = mockDb.getCurrentUser()
    if (!user) {
      return HttpResponse.json({ message: "Não autenticado." }, { status: 401 })
    }
    return HttpResponse.json(user)
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const body = (await request.json()) as { email: string }
    if (!body?.email) {
      return HttpResponse.json({ message: "E-mail é obrigatório." }, { status: 400 })
    }

    const user = mockDb.login(body.email)
    if (!user) {
      return HttpResponse.json({ message: "Credenciais inválidas." }, { status: 401 })
    }
    return HttpResponse.json({ user, token: "mock-jwt-token-12345" })
  }),

  http.post("/api/auth/register", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const body = (await request.json()) as { name: string; email: string; username: string }
    if (!body.email || !body.username || !body.name) {
      return HttpResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 })
    }

    // Tratamento de conflito conforme REQ-01 / REQ-05
    const existing = mockDb.getState().users.find(
      u => u.email.toLowerCase() === body.email.toLowerCase() || u.username.toLowerCase() === body.username.toLowerCase()
    )
    if (existing) {
      return HttpResponse.json(
        { message: "E-mail ou nome de usuário já cadastrado." },
        { status: 409 }
      )
    }

    const newUser = mockDb.register(body.name, body.email, body.username)
    return HttpResponse.json({ user: newUser, token: "mock-jwt-token-registered" }, { status: 201 })
  }),

  http.post("/api/auth/logout", async () => {
    mockDb.logout()
    return HttpResponse.json({ success: true })
  }),

  // --- Perfil & Carteiras ---
  http.patch("/api/profile", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const currentUser = mockDb.getCurrentUser()
    if (!currentUser) {
      return HttpResponse.json({ message: "Não autorizado." }, { status: 401 })
    }

    const body = (await request.json()) as any
    const updated = mockDb.updateProfile(currentUser.id, body)
    return HttpResponse.json(updated)
  }),

  http.post("/api/profile/change-password", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const body = (await request.json()) as { currentPassword?: string; newPassword?: string }
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json({ message: "Senhas devem ser preenchidas." }, { status: 400 })
    }
    if (body.newPassword.length < 6) {
      return HttpResponse.json({ message: "A nova senha deve ter no mínimo 6 caracteres." }, { status: 400 })
    }
    return HttpResponse.json({ success: true, message: "Senha alterada com sucesso." })
  }),

  http.get("/api/wallets", async () => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const currentUser = mockDb.getCurrentUser()
    if (!currentUser) {
      return HttpResponse.json({ message: "Não autorizado." }, { status: 401 })
    }
    return HttpResponse.json(mockDb.getWallets(currentUser.id))
  }),

  http.post("/api/wallets", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const currentUser = mockDb.getCurrentUser()
    if (!currentUser) {
      return HttpResponse.json({ message: "Não autorizado." }, { status: 401 })
    }

    const body = (await request.json()) as any
    if (!body.address || !body.address.startsWith("0x")) {
      return HttpResponse.json({ message: "Endereço de carteira inválido." }, { status: 400 })
    }

    const saved = mockDb.saveWallet(currentUser.id, body)
    return HttpResponse.json(saved, { status: 201 })
  }),

  // --- Catálogo & Detalhes de NFTs ---
  http.get("/api/nfts", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const category = url.searchParams.get("category") || "all"
    const sortBy = url.searchParams.get("sort") || "recent"
    const page = parseInt(url.searchParams.get("page") || "1", 10)
    const limit = parseInt(url.searchParams.get("limit") || "6", 10)

    let list = mockDb.getNFTs()

    if (search) {
      list = list.filter(
        n =>
          n.name.toLowerCase().includes(search) ||
          n.collection.toLowerCase().includes(search) ||
          n.description.toLowerCase().includes(search)
      )
    }

    if (category && category !== "all") {
      list = list.filter(n => n.category === category)
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => parseFloat(a.priceEth) - parseFloat(b.priceEth))
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => parseFloat(b.priceEth) - parseFloat(a.priceEth))
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    const total = list.length
    const startIndex = (page - 1) * limit
    const items = list.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    })
  }),

  http.get("/api/nfts/:id", async ({ params }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const nft = mockDb.getNFTById(params.id as string)
    if (!nft) {
      return HttpResponse.json({ message: "NFT não encontrado." }, { status: 404 })
    }
    return HttpResponse.json(nft)
  }),

  // --- Favoritos ---
  http.get("/api/favorites", async () => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const user = mockDb.getCurrentUser()
    if (!user) return HttpResponse.json([])
    return HttpResponse.json(mockDb.getFavorites(user.id))
  }),

  http.post("/api/favorites/:id", async ({ params }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const user = mockDb.getCurrentUser()
    if (!user) {
      return HttpResponse.json({ message: "Login necessário para favoritar." }, { status: 401 })
    }
    const isFav = mockDb.toggleFavorite(user.id, params.id as string)
    return HttpResponse.json({ isFavorite: isFav })
  }),

  // --- Carrinho & Cotação ---
  http.get("/api/cart", async () => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    return HttpResponse.json({
      items: mockDb.getCart(),
      quote: mockDb.calculateQuote()
    })
  }),

  http.post("/api/cart", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const body = (await request.json()) as any
    const items = mockDb.addToCart(body)
    return HttpResponse.json({
      items,
      quote: mockDb.calculateQuote()
    })
  }),

  http.patch("/api/cart", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const body = (await request.json()) as { nftId: string; editionNumber: number; quantity: number }
    const items = mockDb.updateCartItemQuantity(body.nftId, body.editionNumber, body.quantity)
    return HttpResponse.json({
      items,
      quote: mockDb.calculateQuote()
    })
  }),

  http.delete("/api/cart/:nftId/:editionNumber", async ({ params }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const items = mockDb.removeFromCart(
      params.nftId as string,
      parseInt(params.editionNumber as string, 10)
    )
    return HttpResponse.json({
      items,
      quote: mockDb.calculateQuote()
    })
  }),

  http.post("/api/cart/coupon", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const body = (await request.json()) as { code: string }
    const result = mockDb.applyCoupon(body.code)
    if (!result.success) {
      return HttpResponse.json({ message: result.error }, { status: 400 })
    }
    return HttpResponse.json({
      coupon: result.coupon,
      quote: mockDb.calculateQuote()
    })
  }),

  http.delete("/api/cart/coupon", async () => {
    mockDb.removeCoupon()
    return HttpResponse.json({
      quote: mockDb.calculateQuote()
    })
  }),

  // --- Pedidos & Idempotência ---
  http.post("/api/orders", async ({ request }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const idempotencyKey = request.headers.get("Idempotency-Key")
    if (!idempotencyKey) {
      return HttpResponse.json(
        { message: "Header Idempotency-Key é obrigatório para pedidos." },
        { status: 400 }
      )
    }

    const { scenarios } = mockDb.getState()
    if (scenarios.simulateOutOfStock) {
      return HttpResponse.json(
        { message: "Edição esgotada durante a finalização da compra." },
        { status: 409 }
      )
    }

    if (scenarios.simulateTimeout) {
      await delay(4000)
      return HttpResponse.json(
        { message: "Gateway timeout ao processar transação." },
        { status: 504 }
      )
    }

    const body = (await request.json()) as { walletAddress: string; network: string }
    const result = mockDb.createOrder(idempotencyKey, body.walletAddress, body.network)
    return HttpResponse.json(result.order, { status: 201 })
  }),

  http.get("/api/orders/:id", async ({ params }) => {
    const error = await applyScenarioMiddlewares()
    if (error) return error

    const order = mockDb.getOrderById(params.id as string)
    if (!order) {
      return HttpResponse.json({ message: "Pedido não encontrado." }, { status: 404 })
    }
    return HttpResponse.json(order)
  })
]
