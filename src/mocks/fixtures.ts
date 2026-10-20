import { NFTItem, User, Wallet, Coupon } from "@/types"

export const INITIAL_USERS: User[] = [
  {
    id: "user-1",
    name: "Alexandre Kurio",
    email: "contato@email.com",
    username: "alexkurio",
    bio: "Colecionador de arte digital desde 2021. Apaixonado por edições raras e gerativas.",
    ens: "alexkurio.eth",
    website: "https://kurio.art/alex",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    createdAt: "2026-01-15T10:00:00Z"
  },
  {
    id: "user-2",
    name: "Beatriz Nomad",
    email: "beatriz@email.com",
    username: "bnomad",
    bio: "Curadora independente e entusiasta de web3.",
    ens: "bnomad.eth",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    createdAt: "2026-02-01T12:00:00Z"
  }
]

export const INITIAL_WALLETS: Record<string, Wallet[]> = {
  "user-1": [
    {
      id: "w-1",
      name: "MetaMask Principal",
      address: "0x7A42b59F9C38cD71912fE30d43C654318d19E8",
      network: "Ethereum",
      isPrimary: true,
      alias: "Vault Pessoal"
    },
    {
      id: "w-2",
      name: "Rabi Secundária",
      address: "0x9F33b11A7c82eE62402dA45c928E10943892A1",
      network: "Polygon",
      isPrimary: false,
      alias: "Hot Wallet"
    }
  ],
  "user-2": [
    {
      id: "w-3",
      name: "Ledger",
      address: "0x33bC56113A7c82eE62402dA45c928E10943892F5",
      network: "Ethereum",
      isPrimary: true
    }
  ]
}

export const INITIAL_COUPONS: Coupon[] = [
  { code: "KURIO10", discountPercent: 10, active: true },
  { code: "GENESIS20", discountPercent: 20, active: true },
  { code: "EXPIRED50", discountPercent: 50, active: false }
]

export const INITIAL_NFTS: NFTItem[] = [
  {
    id: "nft-1",
    tokenId: "#0042",
    name: "Emerald Ape #042",
    description: "Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.",
    collection: "Kurio Apes",
    category: "trending",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80",
    priceEth: "1.19",
    creator: {
      name: "Studio Kurio",
      address: "0x7A42...19E8",
      royaltyPercent: 5
    },
    contractAddress: "0x7A42b59F9C38cD71912fE30d43C654318d19E8",
    editions: [
      { editionNumber: 1, totalEditions: 50, priceEth: "1.19", available: true },
      { editionNumber: 2, totalEditions: 50, priceEth: "1.19", available: true },
      { editionNumber: 3, totalEditions: 50, priceEth: "1.25", available: true }
    ],
    attributes: [
      { trait_type: "Acessório", value: "Óculos" },
      { trait_type: "Matiz", value: "Esmeralda" },
      { trait_type: "Raridade", value: "Lendário" }
    ],
    stockAvailable: 47,
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "nft-2",
    tokenId: "#0118",
    name: "Cosmic Bloom #118",
    description: "Formas orgânicas gerativas capturadas em momentos estocásticos de expansão vetorial.",
    collection: "Generative Horizons",
    category: "new",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    priceEth: "0.85",
    creator: {
      name: "Elena Rostova",
      address: "0x89C1...42A1",
      royaltyPercent: 5
    },
    contractAddress: "0x89C134bF9C38cD71912fE30d43C654318d19E8",
    editions: [
      { editionNumber: 1, totalEditions: 25, priceEth: "0.85", available: true }
    ],
    attributes: [
      { trait_type: "Paleta", value: "Nebulosa" },
      { trait_type: "Dimensão", value: "3D Procedural" }
    ],
    stockAvailable: 12,
    createdAt: "2026-03-05T14:30:00Z"
  },
  {
    id: "nft-3",
    tokenId: "#0207",
    name: "Golden Beat #207",
    description: "Sintetizador visual e frequências harmônicas renderizadas em ouro oxidado.",
    collection: "Soundwaves",
    category: "trending",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    priceEth: "1.98",
    creator: {
      name: "Marcus Vance",
      address: "0x34A1...77B2",
      royaltyPercent: 5
    },
    contractAddress: "0x34A124bF9C38cD71912fE30d43C654318d19E8",
    editions: [
      { editionNumber: 1, totalEditions: 50, priceEth: "1.98", available: true }
    ],
    attributes: [
      { trait_type: "Elemento", value: "Ouro Polido" },
      { trait_type: "Freq", value: "432Hz" }
    ],
    stockAvailable: 22,
    createdAt: "2026-02-28T09:15:00Z"
  },
  {
    id: "nft-4",
    tokenId: "#0009",
    name: "Sage Nomad #009",
    description: "Exploração de texturas e silêncio no deserto criptográfico.",
    collection: "Nomads",
    category: "all",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    priceEth: "2.40",
    creator: {
      name: "Studio Kurio",
      address: "0x7A42...19E8",
      royaltyPercent: 5
    },
    contractAddress: "0x7A42b59F9C38cD71912fE30d43C654318d19E8",
    editions: [
      { editionNumber: 1, totalEditions: 10, priceEth: "2.40", available: true }
    ],
    attributes: [
      { trait_type: "Terreno", value: "Dunas" },
      { trait_type: "Hora", value: "Crepúsculo" }
    ],
    stockAvailable: 3,
    createdAt: "2026-02-15T18:00:00Z"
  },
  {
    id: "nft-5",
    tokenId: "#0314",
    name: "Violet Nomad #314",
    description: "Edição singular 1/1 de geometria hiperbólica com fluorescência ultravioleta.",
    collection: "Nomads",
    category: "trending",
    image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&auto=format&fit=crop&q=80",
    priceEth: "1.39",
    creator: {
      name: "Elena Rostova",
      address: "0x89C1...42A1",
      royaltyPercent: 5
    },
    contractAddress: "0x89C134bF9C38cD71912fE30d43C654318d19E8",
    editions: [
      { editionNumber: 1, totalEditions: 1, priceEth: "1.39", available: true }
    ],
    attributes: [
      { trait_type: "Edição", value: "1 de 1" },
      { trait_type: "Luz", value: "Ultravioleta" }
    ],
    stockAvailable: 1,
    createdAt: "2026-03-08T11:00:00Z"
  },
  {
    id: "nft-6",
    tokenId: "#0071",
    name: "Golden Frequency #071",
    description: "Cunhagem exclusiva da série Genesis com metadados mutáveis vinculados à liquidez da rede.",
    collection: "Soundwaves",
    category: "new",
    image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80",
    priceEth: "3.58",
    creator: {
      name: "Marcus Vance",
      address: "0x34A1...77B2",
      royaltyPercent: 5
    },
    contractAddress: "0x34A124bF9C38cD71912fE30d43C654318d19E8",
    editions: [
      { editionNumber: 1, totalEditions: 10, priceEth: "3.58", available: true }
    ],
    attributes: [
      { trait_type: "Ressonância", value: "Harmônica" },
      { trait_type: "Gradiente", value: "Âmbar" }
    ],
    stockAvailable: 5,
    createdAt: "2026-03-10T08:00:00Z"
  }
]
