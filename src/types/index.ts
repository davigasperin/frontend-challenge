export interface User {
  id: string
  name: string
  email: string
  username: string
  bio?: string
  ens?: string
  website?: string
  avatarUrl?: string
  createdAt: string
}

export interface Wallet {
  id: string
  name: string
  address: string
  network: "Ethereum" | "Polygon" | "Arbitrum"
  isPrimary: boolean
  alias?: string
}

export interface NFTAttribute {
  trait_type: string
  value: string
}

export interface NFTEdition {
  editionNumber: number
  totalEditions: number
  priceEth: string // string decimal para manter precisão conforme README
  available: boolean
}

export interface NFTItem {
  id: string
  tokenId: string
  name: string
  description: string
  collection: string
  category: "all" | "new" | "trending"
  image: string
  priceEth: string // decimal string
  creator: {
    name: string
    address: string
    royaltyPercent: number // 5% fixo do design
  }
  contractAddress: string
  editions: NFTEdition[]
  attributes: NFTAttribute[]
  stockAvailable: number
  createdAt: string
}

export interface CartItem {
  nftId: string
  editionNumber: number
  quantity: number
  priceEth: string
  name: string
  image: string
  collection: string
}

export interface Coupon {
  code: string
  discountPercent: number
  active: boolean
}

export interface OrderItem {
  nftId: string
  name: string
  image: string
  editionNumber: number
  quantity: number
  priceEth: string
}

export interface Order {
  id: string
  idempotencyKey: string
  userId: string
  status: "pending" | "confirmed" | "rejected"
  items: OrderItem[]
  subtotalEth: string
  discountEth: string
  gasFeeEth: string
  totalEth: string
  walletAddress: string
  network: string
  transactionHash: string
  createdAt: string
  version: number
}

export interface ScenarioConfig {
  latencyMs: number
  failRate: number // 0 a 1
  simulateExpiredSession: boolean
  simulateTimeout: boolean
  simulatePriceChangeOnCheckout: boolean
  simulateOutOfStock: boolean
}
