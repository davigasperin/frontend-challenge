import {
  User,
  Wallet,
  NFTItem,
  CartItem,
  Order,
  ScenarioConfig,
  Coupon
} from "@/types"
import {
  INITIAL_USERS,
  INITIAL_WALLETS,
  INITIAL_NFTS,
  INITIAL_COUPONS
} from "./fixtures"

const STORAGE_KEY = "kurio_mock_db_v1"

export interface MockDatabaseState {
  users: User[]
  currentUser: User | null
  wallets: Record<string, Wallet[]>
  nfts: NFTItem[]
  favorites: Record<string, string[]> // userId -> nftIds[]
  cart: CartItem[]
  coupons: Coupon[]
  appliedCoupon: Coupon | null
  orders: Order[]
  scenarios: ScenarioConfig
}

const DEFAULT_SCENARIOS: ScenarioConfig = {
  latencyMs: 150,
  failRate: 0,
  simulateExpiredSession: false,
  simulateTimeout: false,
  simulatePriceChangeOnCheckout: false,
  simulateOutOfStock: false,
}

function getInitialState(): MockDatabaseState {
  return {
    users: [...INITIAL_USERS],
    currentUser: INITIAL_USERS[0], // Alexandre Kurio como default logado
    wallets: JSON.parse(JSON.stringify(INITIAL_WALLETS)),
    nfts: JSON.parse(JSON.stringify(INITIAL_NFTS)),
    favorites: {
      "user-1": ["nft-1", "nft-3"],
      "user-2": ["nft-2"]
    },
    cart: [
      {
        nftId: "nft-1",
        name: "Emerald Ape #042",
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80",
        collection: "Kurio Apes",
        editionNumber: 1,
        quantity: 1,
        priceEth: "1.19"
      },
      {
        nftId: "nft-5",
        name: "Violet Nomad #314",
        image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&auto=format&fit=crop&q=80",
        collection: "Nomads",
        editionNumber: 1,
        quantity: 1,
        priceEth: "1.39"
      }
    ],
    coupons: [...INITIAL_COUPONS],
    appliedCoupon: null,
    orders: [],
    scenarios: { ...DEFAULT_SCENARIOS }
  }
}

class MockDatabase {
  private state: MockDatabaseState

  constructor() {
    this.state = this.loadFromStorage() || getInitialState()
  }

  private loadFromStorage(): MockDatabaseState | null {
    try {
      if (typeof window === "undefined") return null
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  public persistState(): void {
    this.persist()
  }

  private persist() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
      }
    } catch {
      // Ignora erro de cota de storage
    }
  }

  public getState(): MockDatabaseState {
    return this.state
  }

  public resetToKnownState(): void {
    this.state = getInitialState()
    this.persist()
  }

  // --- Scenarios ---
  public updateScenarios(partial: Partial<ScenarioConfig>) {
    this.state.scenarios = { ...this.state.scenarios, ...partial }
    this.persist()
  }

  // --- Auth ---
  public getCurrentUser(): User | null {
    return this.state.currentUser
  }

  public login(email: string): User | null {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (user) {
      this.state.currentUser = user
      this.persist()
      return user
    }
    return null
  }

  public register(name: string, email: string, username: string): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      username,
      createdAt: new Date().toISOString()
    }
    this.state.users.push(newUser)
    this.state.currentUser = newUser
    this.state.wallets[newUser.id] = [
      {
        id: `w-${Date.now()}`,
        name: "Carteira Padrão",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        network: "Ethereum",
        isPrimary: true
      }
    ]
    this.persist()
    return newUser
  }

  public logout(): void {
    this.state.currentUser = null
    this.persist()
  }

  public updateProfile(userId: string, partial: Partial<User>): User | null {
    const user = this.state.users.find(u => u.id === userId)
    if (!user) return null
    Object.assign(user, partial)
    if (this.state.currentUser?.id === userId) {
      Object.assign(this.state.currentUser, partial)
    }
    this.persist()
    return user
  }

  // --- Wallets ---
  public getWallets(userId: string): Wallet[] {
    return this.state.wallets[userId] || []
  }

  public saveWallet(userId: string, wallet: Omit<Wallet, "id"> & { id?: string }): Wallet {
    if (!this.state.wallets[userId]) {
      this.state.wallets[userId] = []
    }
    const list = this.state.wallets[userId]
    if (wallet.isPrimary) {
      list.forEach(w => { w.isPrimary = false })
    }

    if (wallet.id) {
      const idx = list.findIndex(w => w.id === wallet.id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...wallet, id: wallet.id }
        this.persist()
        return list[idx]
      }
    }

    const newWallet: Wallet = {
      ...wallet,
      id: `w-${Date.now()}`
    }
    list.push(newWallet)
    this.persist()
    return newWallet
  }

  public deleteWallet(userId: string, walletId: string): boolean {
    if (!this.state.wallets[userId]) return false
    const list = this.state.wallets[userId]
    const idx = list.findIndex(w => w.id === walletId)
    if (idx === -1) return false
    const wasPrimary = list[idx].isPrimary
    list.splice(idx, 1)
    if (wasPrimary && list.length > 0) {
      list[0].isPrimary = true
    }
    this.persist()
    return true
  }

  public setPrimaryWallet(userId: string, walletId: string): boolean {
    if (!this.state.wallets[userId]) return false
    const list = this.state.wallets[userId]
    let found = false
    list.forEach(w => {
      if (w.id === walletId) {
        w.isPrimary = true
        found = true
      } else {
        w.isPrimary = false
      }
    })
    if (found) this.persist()
    return found
  }

  // --- NFTs & Favorites ---
  public getNFTs(): NFTItem[] {
    return this.state.nfts
  }

  public getNFTById(id: string): NFTItem | undefined {
    return this.state.nfts.find(n => n.id === id)
  }

  public updateNFT(id: string, updates: Partial<NFTItem>): NFTItem | null {
    const nft = this.state.nfts.find(n => n.id === id)
    if (!nft) return null
    Object.assign(nft, updates)
    this.persist()
    return nft
  }

  public getFavorites(userId: string): string[] {
    return this.state.favorites[userId] || []
  }

  public toggleFavorite(userId: string, nftId: string): boolean {
    if (!this.state.favorites[userId]) {
      this.state.favorites[userId] = []
    }
    const list = this.state.favorites[userId]
    const idx = list.indexOf(nftId)
    let isFav = false
    if (idx === -1) {
      list.push(nftId)
      isFav = true
    } else {
      list.splice(idx, 1)
      isFav = false
    }
    this.persist()
    return isFav
  }

  // --- Cart & Quote ---
  public getCart(): CartItem[] {
    return this.state.cart
  }

  public addToCart(item: CartItem): CartItem[] {
    const existing = this.state.cart.find(
      c => c.nftId === item.nftId && c.editionNumber === item.editionNumber
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      this.state.cart.push({ ...item })
    }
    this.persist()
    return this.state.cart
  }

  public updateCartItemQuantity(nftId: string, editionNumber: number, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeFromCart(nftId, editionNumber)
    }
    const item = this.state.cart.find(
      c => c.nftId === nftId && c.editionNumber === editionNumber
    )
    if (item) {
      item.quantity = quantity
    }
    this.persist()
    return this.state.cart
  }

  public removeFromCart(nftId: string, editionNumber: number): CartItem[] {
    this.state.cart = this.state.cart.filter(
      c => !(c.nftId === nftId && c.editionNumber === editionNumber)
    )
    this.persist()
    return this.state.cart
  }

  public applyCoupon(code: string): { success: boolean; coupon?: Coupon; error?: string } {
    const coupon = this.state.coupons.find(
      c => c.code.toUpperCase() === code.toUpperCase()
    )
    if (!coupon) {
      return { success: false, error: "Código de cupom inválido." }
    }
    if (!coupon.active) {
      return { success: false, error: "Este cupom já expirou." }
    }
    this.state.appliedCoupon = coupon
    this.persist()
    return { success: true, coupon }
  }

  public removeCoupon(): void {
    this.state.appliedCoupon = null
    this.persist()
  }

  public calculateQuote(): {
    subtotalEth: string
    discountEth: string
    gasFeeEth: string
    totalEth: string
    appliedCoupon: Coupon | null
    itemsCount: number
  } {
    let subtotalNum = 0
    let totalItems = 0

    for (const item of this.state.cart) {
      const p = parseFloat(item.priceEth) || 0
      subtotalNum += p * item.quantity
      totalItems += item.quantity
    }

    let discountNum = 0
    if (this.state.appliedCoupon) {
      discountNum = subtotalNum * (this.state.appliedCoupon.discountPercent / 100)
    }

    // Taxa de rede fixa simulada: 0.004 ETH se houver itens
    const gasFeeNum = totalItems > 0 ? 0.004 : 0
    const totalNum = Math.max(0, subtotalNum - discountNum + gasFeeNum)

    return {
      subtotalEth: subtotalNum.toFixed(4),
      discountEth: discountNum.toFixed(4),
      gasFeeEth: gasFeeNum.toFixed(4),
      totalEth: totalNum.toFixed(4),
      appliedCoupon: this.state.appliedCoupon,
      itemsCount: totalItems
    }
  }

  // --- Orders & Idempotency ---
  public findOrderByIdempotencyKey(key: string): Order | undefined {
    return this.state.orders.find(o => o.idempotencyKey === key)
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find(o => o.id === id)
  }

  public createOrder(
    idempotencyKey: string,
    walletAddress: string,
    network: string
  ): { order: Order; conflict?: boolean } {
    const existing = this.findOrderByIdempotencyKey(idempotencyKey)
    if (existing) {
      // Reutilização da mesma chave: retorna o mesmo pedido (idempotência garantida)
      return { order: existing }
    }

    const quote = this.calculateQuote()
    const orderItems: OrderItem[] = this.state.cart.map(c => ({
      nftId: c.nftId,
      name: c.name,
      image: c.image,
      editionNumber: c.editionNumber,
      quantity: c.quantity,
      priceEth: c.priceEth
    }))

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      idempotencyKey,
      userId: this.state.currentUser?.id || "guest",
      status: "confirmed", // Mock default confirmado
      items: orderItems,
      subtotalEth: quote.subtotalEth,
      discountEth: quote.discountEth,
      gasFeeEth: quote.gasFeeEth,
      totalEth: quote.totalEth,
      walletAddress,
      network,
      transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      createdAt: new Date().toISOString(),
      version: 1
    }

    this.state.orders.push(newOrder)
    // Limpa o carrinho após confirmação conforme o README (apenas itens comprados)
    this.state.cart = []
    this.state.appliedCoupon = null
    this.persist()

    return { order: newOrder }
  }
}

export const mockDb = new MockDatabase()
