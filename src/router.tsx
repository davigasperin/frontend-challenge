import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
  useSearch,
  useParams,
} from "@tanstack/react-router"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { ScenarioPanel } from "@/components/common/ScenarioPanel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { mockDb } from "@/mocks/db"
import { formatEth } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { z } from "zod"

// 1. Root Route com Layout Global
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-kurio-bg text-kurio-text-primary font-mono selection:bg-kurio-accent selection:text-kurio-bg">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <ScenarioPanel />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-kurio-accent">404</h1>
      <p className="text-kurio-text-secondary">Página não encontrada no marketplace Kurio.</p>
      <Link to="/">
        <Button variant="default">Voltar para a Home</Button>
      </Link>
    </div>
  ),
})

// Schema de validação dos Search Params da Home / Catálogo
const catalogueSearchSchema = z.object({
  search: z.string().optional().default(""),
  category: z.enum(["all", "new", "trending"]).optional().default("all"),
  sort: z.enum(["recent", "price-asc", "price-desc"]).optional().default("recent"),
  page: z.number().int().positive().optional().default(1),
})

// 2. Rota Home / Catálogo
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: catalogueSearchSchema,
  component: CatalogueView,
})

function CatalogueView() {
  const searchParams = useSearch({ from: "/" })
  const navigate = useNavigate({ from: "/" })
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "")
  const nfts = mockDb.getNFTs()

  // Sincroniza busca com debounce leve
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (searchParams.search || "")) {
        navigate({
          search: (prev) => ({ ...prev, search: searchTerm, page: 1 }),
        })
      }
    }, 250)
    return () => clearTimeout(handler)
  }, [searchTerm, searchParams.search, navigate])

  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch =
      !searchParams.search ||
      nft.name.toLowerCase().includes(searchParams.search.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchParams.search.toLowerCase())
    const matchesCategory = searchParams.category === "all" || nft.category === searchParams.category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 py-6 border-b border-kurio-border">
        <div className="flex flex-col gap-4 max-w-xl">
          <Badge variant="default" className="w-fit">Coleção Curada 2026</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-kurio-text-primary leading-tight">
            Descubra e colecione arte digital autêntica
          </h1>
          <p className="text-kurio-text-secondary text-sm leading-relaxed">
            Marketplace de NFTs verificado na Ethereum. Edições limitadas, proveniência imutável e transações transparentes.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link to="/cart">
              <Button size="lg" variant="default">Ver Carrinho</Button>
            </Link>
            <Link to="/wallets">
              <Button size="lg" variant="outline">Minhas Carteiras</Button>
            </Link>
          </div>
        </div>

        {/* Card Destaque Hero */}
        <div className="w-full md:w-96 bg-kurio-surface border border-kurio-border p-4 flex flex-col gap-3 shadow-2xl">
          <div className="relative aspect-square w-full overflow-hidden bg-black/40">
            <img
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80"
              alt="Emerald Ape #042"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <span className="absolute top-2 right-2 bg-kurio-bg/90 border border-kurio-border px-2 py-1 text-[10px] text-kurio-accent">
              Destaque
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-kurio-text-muted">Kurio Apes</p>
              <h2 className="text-base font-bold text-kurio-text-primary">Emerald Ape #042</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-kurio-text-muted">Preço Atual</p>
              <p className="text-sm font-bold text-kurio-accent">{formatEth("1.19")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Controles de Filtros e Busca */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Input
            placeholder="Buscar por nome ou coleção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Categorias (Abas) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(["all", "trending", "new"] as const).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={searchParams.category === cat ? "default" : "secondary"}
              onClick={() => navigate({ search: (prev) => ({ ...prev, category: cat, page: 1 }) })}
              className="text-xs capitalize"
            >
              {cat === "all" ? "Todos" : cat === "trending" ? "Em Alta" : "Recentes"}
            </Button>
          ))}
        </div>
      </section>

      {/* Grid de NFTs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNFTs.map((nft) => (
          <Link
            key={nft.id}
            to="/nft/$id"
            params={{ id: nft.id }}
            className="group bg-kurio-surface border border-kurio-border hover:border-kurio-accent transition-all duration-300 p-4 flex flex-col gap-4"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-black/40">
              <img
                src={nft.image}
                alt={nft.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 bg-kurio-bg/90 border border-kurio-border px-2 py-0.5 text-[10px] text-kurio-text-secondary">
                {nft.tokenId}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-kurio-text-muted uppercase tracking-wider">{nft.collection}</span>
              <h3 className="text-base font-bold text-kurio-text-primary group-hover:text-kurio-accent transition-colors">
                {nft.name}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-kurio-border/60 mt-auto">
              <div>
                <p className="text-[10px] uppercase text-kurio-text-muted">Preço</p>
                <p className="text-sm font-bold text-kurio-accent">{formatEth(nft.priceEth)}</p>
              </div>
              <Button size="sm" variant="secondary" className="text-xs group-hover:bg-kurio-accent group-hover:text-kurio-bg">
                Ver Detalhes
              </Button>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}

// 3. Rota Detalhes do NFT (/nft/$id)
const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$id",
  component: NFTDetailView,
})

function NFTDetailView() {
  const { id } = useParams({ from: "/nft/$id" })
  const nft = mockDb.getNFTById(id)
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  if (!nft) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-kurio-accent">NFT Não Encontrado</h2>
        <Link to="/"><Button variant="default">Voltar ao Catálogo</Button></Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    mockDb.addToCart({
      nftId: nft.id,
      editionNumber: 1,
      quantity: 1,
      priceEth: nft.priceEth,
      name: nft.name,
      image: nft.image,
      collection: nft.collection,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-6">
      {/* Imagem do NFT */}
      <div className="bg-kurio-surface border border-kurio-border p-4 flex flex-col gap-4">
        <div className="aspect-square w-full overflow-hidden bg-black/40">
          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center justify-between text-xs text-kurio-text-secondary pt-2">
          <span>Contrato: {nft.contractAddress.slice(0, 10)}...</span>
          <span>Token ID: {nft.tokenId}</span>
        </div>
      </div>

      {/* Informações e Compra */}
      <div className="flex flex-col gap-6">
        <div>
          <Badge variant="outline" className="text-xs uppercase">{nft.collection}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-kurio-text-primary mt-2">{nft.name}</h1>
          <p className="text-xs text-kurio-text-secondary mt-1">Criado por <span className="text-kurio-accent">{nft.creator.name}</span></p>
        </div>

        <p className="text-sm text-kurio-text-secondary leading-relaxed">{nft.description}</p>

        {/* Box de Preço e Ações */}
        <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase text-kurio-text-muted">Preço por Edição</span>
            <span className="text-2xl font-bold text-kurio-accent">{formatEth(nft.priceEth)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-kurio-text-secondary border-t border-kurio-border pt-3">
            <span>Edições Disponíveis: {nft.stockAvailable}</span>
            <span>Royalty: {nft.creator.royaltyPercent}%</span>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              className="flex-1"
              variant={added ? "secondary" : "default"}
              onClick={handleAddToCart}
            >
              {added ? "Adicionado ao Carrinho!" : "Adicionar ao Carrinho"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                handleAddToCart()
                navigate({ to: "/cart" })
              }}
            >
              Comprar Agora
            </Button>
          </div>
        </div>

        {/* Atributos */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase text-kurio-text-primary">Propriedades & Atributos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {nft.attributes.map((attr, idx) => (
              <div key={idx} className="p-3 bg-kurio-surface border border-kurio-border flex flex-col gap-1">
                <span className="text-[10px] text-kurio-text-muted uppercase">{attr.trait_type}</span>
                <span className="text-xs font-bold text-kurio-text-primary">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 4. Rota Carrinho (/cart)
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartView,
})

function CartView() {
  const [cart, setCart] = useState(mockDb.getCart())
  const [quote, setQuote] = useState(mockDb.calculateQuote())
  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState("")

  const refreshCart = () => {
    setCart([...mockDb.getCart()])
    setQuote(mockDb.calculateQuote())
  }

  const handleApplyCoupon = () => {
    setCouponError("")
    const res = mockDb.applyCoupon(couponInput)
    if (!res.success) {
      setCouponError(res.error || "Cupom inválido.")
    } else {
      setCouponInput("")
      refreshCart()
    }
  }

  const handleRemoveCoupon = () => {
    mockDb.removeCoupon()
    refreshCart()
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Carrinho de Compras</h1>

      {cart.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center border border-dashed border-kurio-border p-12">
          <p className="text-kurio-text-secondary">Seu carrinho está vazio.</p>
          <Link to="/"><Button variant="default">Explorar NFTs</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map((item) => (
              <div
                key={`${item.nftId}-${item.editionNumber}`}
                className="flex items-center gap-4 p-4 bg-kurio-surface border border-kurio-border"
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-black/40 border border-kurio-border" />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] text-kurio-text-muted uppercase">{item.collection}</span>
                  <h3 className="text-sm font-bold text-kurio-text-primary">{item.name}</h3>
                  <span className="text-xs text-kurio-accent">{formatEth(item.priceEth)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      mockDb.updateCartItemQuantity(item.nftId, item.editionNumber, item.quantity - 1)
                      refreshCart()
                    }}
                  >
                    -
                  </Button>
                  <span className="text-xs px-2">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      mockDb.updateCartItemQuantity(item.nftId, item.editionNumber, item.quantity + 1)
                      refreshCart()
                    }}
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    mockDb.removeFromCart(item.nftId, item.editionNumber)
                    refreshCart()
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          {/* Resumo da Cotação */}
          <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4 h-fit">
            <h2 className="text-base font-bold text-kurio-text-primary uppercase tracking-wider border-b border-kurio-border pb-3">
              Resumo do Pedido
            </h2>

            <div className="flex flex-col gap-2 text-xs text-kurio-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal ({quote.itemsCount} itens):</span>
                <span>{quote.subtotalEth} ETH</span>
              </div>
              {quote.appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Desconto ({quote.appliedCoupon.code} - {quote.appliedCoupon.discountPercent}%):</span>
                  <span>-{quote.discountEth} ETH</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxa de Rede (Gas estimada):</span>
                <span>{quote.gasFeeEth} ETH</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-kurio-border text-sm font-bold text-kurio-text-primary">
                <span>Total:</span>
                <span className="text-kurio-accent">{quote.totalEth} ETH</span>
              </div>
            </div>

            {/* Cupom */}
            <div className="pt-3 border-t border-kurio-border flex flex-col gap-2">
              <span className="text-xs text-kurio-text-muted">Possui cupom de desconto?</span>
              {quote.appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 p-2 text-xs text-emerald-400">
                  <span>{quote.appliedCoupon.code} aplicado</span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:underline">Remover</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código (ex: KURIO10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button size="sm" variant="secondary" onClick={handleApplyCoupon} className="h-9 text-xs">
                    Aplicar
                  </Button>
                </div>
              )}
              {couponError && <span className="text-[11px] text-red-400">{couponError}</span>}
            </div>

            <Link to="/checkout" className="w-full mt-2">
              <Button className="w-full" variant="default" size="lg">
                Prosseguir para Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// 5. Rota Checkout (/checkout)
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutView,
})

function CheckoutView() {
  const navigate = useNavigate()
  const user = mockDb.getCurrentUser()
  const wallets = user ? mockDb.getWallets(user.id) : []
  const quote = mockDb.calculateQuote()
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.address || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const handleConfirmOrder = async () => {
    if (!selectedWallet) {
      setCheckoutError("Selecione uma carteira para assinar a transação.")
      return
    }

    setIsProcessing(true)
    setCheckoutError("")

    try {
      const res = await mockDb.createOrder(
        `idemp-${Date.now()}`,
        selectedWallet,
        "Ethereum"
      )
      navigate({ to: "/checkout/receipt", search: { orderId: res.order.id } })
    } catch (err: any) {
      setCheckoutError(err?.message || "Falha na transação.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Finalizar Compra</h1>

      <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">1. Carteira de Pagamento</h2>
        {wallets.length === 0 ? (
          <p className="text-xs text-kurio-text-secondary">Nenhuma carteira conectada. Adicione uma carteira para continuar.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {wallets.map((w) => (
              <label
                key={w.id}
                className={`flex items-center justify-between p-3 border cursor-pointer text-xs ${
                  selectedWallet === w.address ? "border-kurio-accent bg-kurio-accent/10" : "border-kurio-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="wallet"
                    value={w.address}
                    checked={selectedWallet === w.address}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="accent-kurio-accent"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-kurio-text-primary">{w.name}</span>
                    <span className="text-[11px] text-kurio-text-muted">{w.address}</span>
                  </div>
                </div>
                <Badge variant="outline">{w.network}</Badge>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-3 text-xs">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">2. Total da Transação</h2>
        <div className="flex justify-between"><span>Subtotal:</span><span>{quote.subtotalEth} ETH</span></div>
        <div className="flex justify-between"><span>Taxa de Gas:</span><span>{quote.gasFeeEth} ETH</span></div>
        <div className="flex justify-between pt-2 border-t border-kurio-border font-bold text-sm text-kurio-text-primary">
          <span>Total a Pagar:</span><span className="text-kurio-accent">{quote.totalEth} ETH</span>
        </div>
      </div>

      {checkoutError && <p className="text-xs text-red-400 p-3 bg-red-950/40 border border-red-800">{checkoutError}</p>}

      <Button
        size="lg"
        variant="default"
        disabled={isProcessing || !selectedWallet}
        onClick={handleConfirmOrder}
        className="w-full"
      >
        {isProcessing ? "Confirmando na Blockchain..." : "Assinar & Pagar com Carteira"}
      </Button>
    </div>
  )
}

// 6. Rota Comprovante (/checkout/receipt)
const receiptSearchSchema = z.object({
  orderId: z.string().optional(),
})

const receiptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/receipt",
  validateSearch: receiptSearchSchema,
  component: ReceiptView,
})

function ReceiptView() {
  const search = useSearch({ from: "/checkout/receipt" })
  const order = search.orderId ? mockDb.getOrderById(search.orderId) : undefined

  return (
    <div className="max-w-xl mx-auto py-8 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center text-emerald-400 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Transação Confirmada!</h1>
      <p className="text-xs text-kurio-text-secondary max-w-md">
        Sua compra foi validada e cunhada na blockchain Ethereum. Os colecionáveis já foram transferidos para sua carteira.
      </p>

      {order && (
        <div className="w-full p-4 bg-kurio-surface border border-kurio-border text-left text-xs flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">ID do Pedido:</span>
            <span className="font-bold text-kurio-text-primary">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">Hash da Transação:</span>
            <span className="text-kurio-accent truncate max-w-[200px]">{order.transactionHash}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">Total Pago:</span>
            <span className="font-bold text-kurio-text-primary">{order.totalEth} ETH</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Link to="/"><Button variant="default">Explorar Mais NFTs</Button></Link>
        <Link to="/profile"><Button variant="outline">Ver Meu Perfil</Button></Link>
      </div>
    </div>
  )
}

// 7. Rota Perfil (/profile)
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileView,
})

function ProfileView() {
  const user = mockDb.getCurrentUser()
  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [saved, setSaved] = useState(false)

  if (!user) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-kurio-text-primary">Conecte sua conta</h2>
        <Button onClick={() => mockDb.login("contato@email.com")}>Entrar como Alexandre Kurio</Button>
      </div>
    )
  }

  const handleSave = () => {
    mockDb.updateProfile(user.id, { name, bio })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Perfil do Colecionador</h1>

      <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
        <div className="flex items-center gap-4 border-b border-kurio-border pb-4">
          <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border border-kurio-accent" />
          <div className="flex flex-col">
            <span className="font-bold text-kurio-text-primary">{user.name}</span>
            <span className="text-xs text-kurio-text-muted">{user.email}</span>
            <span className="text-xs text-kurio-accent">{user.ens}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1">
            Nome Completo:
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1">
            Biografia:
            <Input value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
        </div>

        <Button variant="default" onClick={handleSave} className="w-fit self-end text-xs">
          {saved ? "Salvo com Sucesso!" : "Atualizar Perfil"}
        </Button>
      </div>
    </div>
  )
}

// 8. Rota Carteiras (/wallets)
const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallets",
  component: WalletsView,
})

function WalletsView() {
  const user = mockDb.getCurrentUser()
  const wallets = user ? mockDb.getWallets(user.id) : []
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [created, setCreated] = useState(false)

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !address.startsWith("0x")) return
    mockDb.saveWallet(user.id, {
      name: name || "Nova Carteira",
      address,
      network: "Ethereum",
      isPrimary: wallets.length === 0,
    })
    setName("")
    setAddress("")
    setCreated(true)
    setTimeout(() => setCreated(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Minhas Carteiras</h1>

      <div className="flex flex-col gap-3">
        {wallets.map((w) => (
          <div key={w.id} className="p-4 bg-kurio-surface border border-kurio-border flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-xs text-kurio-text-primary">{w.name}</span>
              <span className="text-[11px] text-kurio-text-muted">{w.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={w.isPrimary ? "default" : "secondary"}>
                {w.isPrimary ? "Principal" : w.network}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddWallet} className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">Adicionar Nova Carteira</h2>
        <Input placeholder="Apelido da Carteira (ex: Vault)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Endereço 0x..." value={address} onChange={(e) => setAddress(e.target.value)} required />
        <Button type="submit" variant="default" className="w-fit self-end text-xs">
          {created ? "Carteira Adicionada!" : "Salvar Carteira"}
        </Button>
      </form>
    </div>
  )
}

// 9. Árvore de Rotas e Instância do Router
const routeTree = rootRoute.addChildren([
  indexRoute,
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  receiptRoute,
  profileRoute,
  walletsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
