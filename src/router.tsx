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
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { z } from "zod"
import { MobileTabBar } from "@/components/common/MobileTabBar"
import { useCatalogueQuery, useNFTDetailQuery } from "@/hooks/useNFTs"
import { useCartQuery, useAddToCart, useUpdateCartQuantity, useRemoveFromCart, useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart"
import { useWalletsQuery, useOrderQuery, useCreateOrder } from "@/hooks/useOrders"
import { realtimeClient, NFTUpdatedPayload, OrderUpdatedPayload } from "@/lib/realtime"
import { FavoriteButton } from "@/components/nft/FavoriteButton"
import { NFTGridSkeleton, NFTDetailSkeleton } from "@/components/nft/NFTSkeletons"
import { PromosAndBlogSection } from "@/components/home/PromosAndBlogSection"

// 1. Root Route com Layout Global
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-kurio-bg text-kurio-text-primary font-mono selection:bg-kurio-accent selection:text-kurio-bg pb-16 md:pb-0">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-kurio-accent focus:text-kurio-bg focus:px-4 focus:py-2 focus:font-bold focus:outline-none focus:ring-2 focus:ring-kurio-accent focus:ring-offset-2 focus:ring-offset-kurio-bg"
      >
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo-principal" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
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

  const { data, isLoading, isError, refetch } = useCatalogueQuery({
    search: searchParams.search || "",
    category: searchParams.category || "all",
    sort: searchParams.sort || "recent",
    page: searchParams.page || 1,
  })

  const nfts = data?.items || []

  return (
    <div className="flex flex-col gap-12">
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
        <div className="w-full md:w-96 bg-kurio-surface border border-kurio-border p-4 flex flex-col gap-3 shadow-2xl relative">
          <div className="relative aspect-square w-full overflow-hidden bg-black/40">
            <img
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80"
              alt="Emerald Ape #042"
              width="384"
              height="384"
              fetchPriority="high"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <span className="absolute top-2 right-2 bg-kurio-bg/90 border border-kurio-border px-2 py-1 text-[10px] text-kurio-accent">
              Destaque
            </span>
            <div className="absolute top-2 left-2">
              <FavoriteButton nftId="nft-1" />
            </div>
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

      {/* Controles de Filtros, Abas e Ordenação */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Input
            placeholder="Buscar por nome ou coleção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Categorias (Abas) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
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

          {/* Ordenação */}
          <select
            value={searchParams.sort || "recent"}
            onChange={(e) =>
              navigate({ search: (prev) => ({ ...prev, sort: e.target.value as any, page: 1 }) })
            }
            aria-label="Ordenar NFTs"
            className="h-9 bg-kurio-surface border border-kurio-border px-3 text-xs text-kurio-text-primary focus:border-kurio-accent focus:outline-none"
          >
            <option value="recent">Mais Recentes</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
          </select>
        </div>
      </section>

      {/* Grid de NFTs com Shimmer ou Tratamento de Erro */}
      {isLoading ? (
        <NFTGridSkeleton count={6} />
      ) : isError ? (
        <div className="p-8 text-center border border-red-900 bg-red-950/20 flex flex-col items-center gap-3">
          <p className="text-sm text-red-400 font-bold">Falha ao carregar catálogo de NFTs.</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        </div>
      ) : nfts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-kurio-border flex flex-col items-center gap-3">
          <p className="text-sm text-kurio-text-muted">Nenhum NFT encontrado para o filtro atual.</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSearchTerm("")
              navigate({ search: () => ({ category: "all", sort: "recent", page: 1, search: "" }) })
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Link
              key={nft.id}
              to="/nft/$id"
              params={{ id: nft.id }}
              className="group bg-kurio-surface border border-kurio-border hover:border-kurio-accent transition-all duration-300 p-4 flex flex-col gap-4 relative"
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
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton nftId={nft.id} />
                </div>
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
      )}

      {/* Seção Promos & Blog */}
      <PromosAndBlogSection />
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
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  const { data: nft, isLoading, isError, refetch } = useNFTDetailQuery(id)
  const addToCartMutation = useAddToCart()

  if (isLoading) {
    return <NFTDetailSkeleton />
  }

  if (isError || !nft) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-kurio-accent">NFT Não Encontrado</h2>
        <p className="text-xs text-kurio-text-secondary">O item solicitado não existe ou ocorreu um erro de rede.</p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar Novamente</Button>
          <Link to="/"><Button variant="default" size="sm">Voltar ao Catálogo</Button></Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCartMutation.mutate({
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
      {/* Imagem do NFT com Botão de Favoritar */}
      <div className="bg-kurio-surface border border-kurio-border p-4 flex flex-col gap-4 relative">
        <div className="relative aspect-square w-full overflow-hidden bg-black/40">
          <img src={nft.image} alt={nft.name} width="600" height="600" fetchPriority="high" className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton nftId={nft.id} className="w-10 h-10 shadow-lg" />
          </div>
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
  const { data: cartData, isLoading, isError, refetch } = useCartQuery()
  const updateQuantityMutation = useUpdateCartQuantity()
  const removeItemMutation = useRemoveFromCart()
  const applyCouponMutation = useApplyCoupon()
  const removeCouponMutation = useRemoveCoupon()

  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState("")
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null)

  const cart = cartData?.items ?? []
  const quote = cartData?.quote

  // Tempo real: escuta eventos de atualização de NFT (preço/estoque) e reflete no carrinho
  useEffect(() => {
    const unsubscribe = realtimeClient.on<NFTUpdatedPayload>("nft.updated", (payload) => {
      const inCart = mockDb.getCart().find((c) => c.nftId === payload.nftId)
      if (inCart) {
        refetch()
        setRealtimeAlert(
          `Preço ou estoque de "${inCart.name}" foi atualizado para ${payload.priceEth} ETH (${payload.stockAvailable} em estoque).`
        )
        setTimeout(() => setRealtimeAlert(null), 6000)
      }
    })
    return unsubscribe
  }, [refetch])

  const handleApplyCoupon = () => {
    setCouponError("")
    applyCouponMutation.mutate(couponInput, {
      onSuccess: () => {
        setCouponInput("")
      },
      onError: (err: any) => {
        setCouponError(err?.message || "Cupom inválido.")
      },
    })
  }

  const handleRemoveCoupon = () => {
    removeCouponMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Carrinho de Compras</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-kurio-surface border border-kurio-border">
                <Skeleton className="w-20 h-20" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
          <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4 h-fit">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !cartData || !quote) {
    return (
      <div className="flex flex-col gap-8 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Carrinho de Compras</h1>
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center border border-dashed border-kurio-border p-12">
          <p className="text-kurio-text-secondary">Erro ao carregar o carrinho.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Carrinho de Compras</h1>

      {realtimeAlert && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 text-xs text-amber-400" role="status">
          {realtimeAlert}
        </div>
      )}

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
                <img src={item.image} alt={item.name} width="80" height="80" loading="lazy" className="w-20 h-20 object-cover bg-black/40 border border-kurio-border" />
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
                    disabled={updateQuantityMutation.isPending}
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        nftId: item.nftId,
                        editionNumber: item.editionNumber,
                        quantity: item.quantity - 1,
                      })
                    }
                  >
                    -
                  </Button>
                  <span className="text-xs px-2">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={updateQuantityMutation.isPending}
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        nftId: item.nftId,
                        editionNumber: item.editionNumber,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={removeItemMutation.isPending}
                  onClick={() =>
                    removeItemMutation.mutate({
                      nftId: item.nftId,
                      editionNumber: item.editionNumber,
                    })
                  }
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
  const { data: walletsData, isLoading: isLoadingWallets } = useWalletsQuery()
  const { data: cartData } = useCartQuery()
  const createOrderMutation = useCreateOrder()

  const wallets = walletsData || (user ? mockDb.getWallets(user.id) : [])
  const quote = cartData?.quote || mockDb.calculateQuote()

  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.address || "")
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Ethereum")
  const [checkoutError, setCheckoutError] = useState("")

  useEffect(() => {
    if (!selectedWallet && wallets.length > 0) {
      setSelectedWallet(wallets[0].address)
    }
  }, [wallets, selectedWallet])

  // Guard de rota privada: se não estiver autenticado, orienta para login
  if (!user) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center gap-4 text-center border border-dashed border-kurio-border p-8">
        <h2 className="text-xl font-bold text-kurio-accent">Identificação Necessária</h2>
        <p className="text-xs text-kurio-text-secondary max-w-sm">
          Você precisa estar conectado à sua conta Kurio para concluir a transação e receber os NFTs na sua carteira.
        </p>
        <Link to="/profile">
          <Button variant="default">Conectar Conta</Button>
        </Link>
      </div>
    )
  }

  const handleConfirmOrder = () => {
    if (!selectedWallet) {
      setCheckoutError("Selecione uma carteira para assinar a transação.")
      return
    }

    setCheckoutError("")

    createOrderMutation.mutate(
      {
        walletAddress: selectedWallet,
        network: selectedNetwork,
      },
      {
        onSuccess: (order) => {
          navigate({ to: "/checkout/receipt", search: { orderId: order.id } })
        },
        onError: (err: any) => {
          setCheckoutError(err?.message || "Falha na transação.")
        },
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Finalizar Compra</h1>

      <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">1. Carteira de Pagamento</h2>
        {isLoadingWallets ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : wallets.length === 0 ? (
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
        <h2 className="text-sm font-bold uppercase text-kurio-accent">2. Rede Blockchain</h2>
        <div className="grid grid-cols-2 gap-3">
          {["Ethereum", "Polygon", "Arbitrum", "Optimism"].map((net) => (
            <button
              key={net}
              type="button"
              onClick={() => setSelectedNetwork(net)}
              className={`p-3 border text-left transition-colors flex items-center justify-between ${
                selectedNetwork === net
                  ? "border-kurio-accent bg-kurio-accent/10 text-kurio-text-primary font-bold"
                  : "border-kurio-border text-kurio-text-secondary hover:border-kurio-accent/60"
              }`}
            >
              <span>{net}</span>
              {selectedNetwork === net && <span className="text-kurio-accent">●</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-3 text-xs">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">3. Total da Transação</h2>
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
        disabled={createOrderMutation.isPending || !selectedWallet}
        onClick={handleConfirmOrder}
        className="w-full"
      >
        {createOrderMutation.isPending ? "Confirmando na Blockchain..." : "Assinar & Pagar com Carteira"}
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
  const queryClient = useQueryClient()
  const { data: orderData, isLoading } = useOrderQuery(search.orderId)
  const order = orderData || (search.orderId ? mockDb.getOrderById(search.orderId) : undefined)

  useEffect(() => {
    const handleOrderUpdated = (payload: OrderUpdatedPayload) => {
      if (payload.orderId === search.orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", search.orderId] })
      }
    }

    const unsubscribe = realtimeClient.on<OrderUpdatedPayload>("order.updated", handleOrderUpdated)
    return unsubscribe
  }, [search.orderId, queryClient])

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-12 flex flex-col items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-8 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center text-emerald-400 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Transação Confirmada!</h1>
      <p className="text-xs text-kurio-text-secondary max-w-md">
        Sua compra foi validada e cunhada na blockchain Ethereum. Os colecionáveis já foram transferidos para sua carteira.
      </p>

      {order ? (
        <div className="w-full p-4 bg-kurio-surface border border-kurio-border text-left text-xs flex flex-col gap-2">
          <div className="flex justify-between items-center pb-2 border-b border-kurio-border">
            <span className="text-kurio-text-muted">Status:</span>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
              {order.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">ID do Pedido:</span>
            <span className="font-bold text-kurio-text-primary">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">Hash da Transação:</span>
            <span className="text-kurio-accent truncate max-w-[200px]">{order.transactionHash}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">Rede:</span>
            <span className="font-bold text-kurio-text-primary">{order.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-kurio-text-muted">Carteira:</span>
            <span className="text-kurio-text-secondary truncate max-w-[200px]">{order.walletAddress}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-kurio-border">
            <span className="text-kurio-text-muted">Total Pago:</span>
            <span className="font-bold text-kurio-text-primary">{order.totalEth} ETH</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-kurio-text-secondary">Nenhum pedido encontrado para o identificador fornecido.</p>
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
  const navigate = useNavigate()
  const user = mockDb.getCurrentUser()
  const [tab, setTab] = useState<"info" | "security" | "collection">("info")
  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [ens, setEns] = useState(user?.ens || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [saved, setSaved] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Senhas
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  if (!user) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center gap-6 text-center border border-dashed border-kurio-border p-12">
        <div className="flex flex-col gap-2 max-w-md">
          <h2 className="text-2xl font-bold text-kurio-text-primary">Conecte sua conta</h2>
          <p className="text-xs text-kurio-text-secondary">
            Acesse seu perfil de colecionador para gerenciar carteiras, acompanhar pedidos e visualizar seus colecionáveis digitais.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            onClick={() => {
              mockDb.login("alexandre@kurio.art")
              navigate({ to: "/profile" })
            }}
          >
            Entrar como Alexandre Kurio
          </Button>
          <Link to="/">
            <Button variant="outline">Voltar ao Catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    if (name.trim().length < 3) {
      setProfileError("O nome completo deve ter no mínimo 3 caracteres.")
      return
    }

    mockDb.updateProfile(user.id, {
      name: name.trim(),
      bio: bio.trim(),
      ens: ens.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    if (currentPassword.length < 6) {
      setPasswordError("Informe a senha atual com no mínimo 6 caracteres.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve possuir ao menos 6 caracteres.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("A confirmação de senha não confere.")
      return
    }

    // Simula atualização segura
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordSuccess(true)
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const handleLogout = () => {
    mockDb.logout()
    try {
      localStorage.removeItem("kurio_auth_token")
    } catch {}
    navigate({ to: "/" })
  }

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col gap-8">
      {/* Cabeçalho Perfil */}
      <div className="p-6 sm:p-8 bg-kurio-surface border border-kurio-border flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
            alt={user.name}
            width="80"
            height="80"
            className="w-20 h-20 rounded-full object-cover border-2 border-kurio-accent bg-black/40"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold text-kurio-text-primary">{user.name}</h1>
              <Badge variant="outline" className="text-[10px] text-kurio-accent">Verificado</Badge>
            </div>
            <span className="text-xs text-kurio-accent font-bold">{user.ens || "@" + user.username}</span>
            <span className="text-xs text-kurio-text-muted">{user.email}</span>
            {user.bio && <p className="text-xs text-kurio-text-secondary mt-1 max-w-md">{user.bio}</p>}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-red-400 hover:text-red-300 hover:border-red-500"
        >
          Desconectar
        </Button>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 border-b border-kurio-border pb-2 text-xs">
        <button
          onClick={() => setTab("info")}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition-colors border-b-2 ${
            tab === "info"
              ? "border-kurio-accent text-kurio-accent"
              : "border-transparent text-kurio-text-secondary hover:text-kurio-text-primary"
          }`}
        >
          Dados do Perfil
        </button>
        <button
          onClick={() => setTab("security")}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition-colors border-b-2 ${
            tab === "security"
              ? "border-kurio-accent text-kurio-accent"
              : "border-transparent text-kurio-text-secondary hover:text-kurio-text-primary"
          }`}
        >
          Segurança & Senha
        </button>
        <button
          onClick={() => setTab("collection")}
          className={`px-4 py-2 uppercase font-bold tracking-wider transition-colors border-b-2 ${
            tab === "collection"
              ? "border-kurio-accent text-kurio-accent"
              : "border-transparent text-kurio-text-secondary hover:text-kurio-text-primary"
          }`}
        >
          Colecionáveis
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {tab === "info" && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase text-kurio-accent">Editar Informações Pessoais</h2>

          {profileError && <p className="text-xs text-red-400 p-2 bg-red-950/40 border border-red-800">{profileError}</p>}
          {saved && <p className="text-xs text-emerald-400 p-2 bg-emerald-950/40 border border-emerald-800">Perfil atualizado com sucesso!</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
              Nome Completo:
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
              Domínio ENS (ex: nome.eth):
              <Input value={ens} onChange={(e) => setEns(e.target.value)} placeholder="alexandre.eth" />
            </label>
            <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5 sm:col-span-2">
              URL do Avatar:
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </label>
            <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5 sm:col-span-2">
              Biografia:
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-kurio-bg border border-kurio-border p-3 text-xs text-kurio-text-primary focus:border-kurio-accent focus:outline-none"
                placeholder="Conte sobre suas coleções e interesses no universo Web3..."
              />
            </label>
          </div>

          <Button type="submit" variant="default" className="w-fit self-end text-xs mt-2">
            Salvar Alterações
          </Button>
        </form>
      )}

      {tab === "security" && (
        <form onSubmit={handleChangePassword} className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4 max-w-xl">
          <h2 className="text-sm font-bold uppercase text-kurio-accent">Alteração de Senha</h2>

          {passwordError && <p className="text-xs text-red-400 p-2 bg-red-950/40 border border-red-800">{passwordError}</p>}
          {passwordSuccess && <p className="text-xs text-emerald-400 p-2 bg-emerald-950/40 border border-emerald-800">Senha alterada com sucesso!</p>}

          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
            Senha Atual:
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
            Nova Senha:
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
            Confirmar Nova Senha:
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <Button type="submit" variant="default" className="w-fit self-end text-xs mt-2">
            Atualizar Senha
          </Button>
        </form>
      )}

      {tab === "collection" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase text-kurio-accent">Meus Colecionáveis Adquiridos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mockDb.getNFTs().slice(0, 3).map((nft) => (
              <div key={nft.id} className="bg-kurio-surface border border-kurio-border p-3 flex flex-col gap-2">
                <img src={nft.image} alt={nft.name} width="200" height="200" loading="lazy" className="aspect-square w-full object-cover bg-black/40" />
                <span className="text-[10px] text-kurio-text-muted uppercase">{nft.collection}</span>
                <span className="text-xs font-bold text-kurio-text-primary">{nft.name}</span>
                <Badge variant="outline" className="text-[9px] w-fit">Edição 1/100</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [wallets, setWallets] = useState<any[]>(user ? mockDb.getWallets(user.id) : [])
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [network, setNetwork] = useState<"Ethereum" | "Polygon" | "Arbitrum">("Ethereum")
  const [walletError, setWalletError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const refreshWallets = () => {
    if (user) {
      setWallets([...mockDb.getWallets(user.id)])
    }
  }

  if (!user) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center gap-4 text-center border border-dashed border-kurio-border p-12">
        <h2 className="text-xl font-bold text-kurio-text-primary">Conecte sua conta</h2>
        <p className="text-xs text-kurio-text-secondary max-w-sm">
          Acesse para visualizar e associar suas carteiras Ethereum às compras no marketplace.
        </p>
        <Link to="/profile">
          <Button variant="default">Acessar Conta</Button>
        </Link>
      </div>
    )
  }

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault()
    setWalletError("")
    setSuccessMsg("")

    const cleanAddress = address.trim()
    if (!cleanAddress.startsWith("0x") || cleanAddress.length !== 42) {
      setWalletError("Endereço Ethereum inválido. Deve começar com 0x e conter 42 caracteres.")
      return
    }

    mockDb.saveWallet(user.id, {
      name: name.trim() || "Carteira Principal",
      address: cleanAddress,
      network,
      isPrimary: wallets.length === 0,
    })

    setName("")
    setAddress("")
    setSuccessMsg("Carteira adicionada com sucesso!")
    refreshWallets()
    setTimeout(() => setSuccessMsg(""), 2500)
  }

  const handleSimulateWeb3Connect = (providerName: string) => {
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
    const simulatedAddr = `0x${randomHex}`

    mockDb.saveWallet(user.id, {
      name: `${providerName} Connect`,
      address: simulatedAddr,
      network: "Ethereum",
      isPrimary: wallets.length === 0,
    })

    setSuccessMsg(`${providerName} conectado com sucesso!`)
    refreshWallets()
    setTimeout(() => setSuccessMsg(""), 2500)
  }

  const handleSetPrimary = (walletId: string) => {
    mockDb.setPrimaryWallet(user.id, walletId)
    refreshWallets()
  }

  const handleDeleteWallet = (walletId: string) => {
    mockDb.deleteWallet(user.id, walletId)
    refreshWallets()
  }

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary">Minhas Carteiras</h1>
        <p className="text-xs text-kurio-text-secondary mt-1">
          Gerencie suas carteiras para pagamentos, recebimento de royalties e assinatura de transações.
        </p>
      </div>

      {successMsg && (
        <p className="text-xs text-emerald-400 p-3 bg-emerald-950/40 border border-emerald-800">
          {successMsg}
        </p>
      )}

      {/* Lista de Carteiras Cadastradas */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">Carteiras Conectadas ({wallets.length})</h2>
        {wallets.length === 0 ? (
          <p className="text-xs text-kurio-text-muted p-4 border border-dashed border-kurio-border">
            Nenhuma carteira conectada. Adicione uma carteira abaixo.
          </p>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className={`p-4 bg-kurio-surface border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                w.isPrimary ? "border-kurio-accent/70 bg-kurio-accent/5" : "border-kurio-border"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-kurio-text-primary">{w.name}</span>
                  <Badge variant={w.isPrimary ? "default" : "outline"} className="text-[10px]">
                    {w.isPrimary ? "Carteira Principal" : "Secundária"}
                  </Badge>
                  <span className="text-[10px] text-kurio-text-muted">({w.network})</span>
                </div>
                <span className="text-xs text-kurio-accent font-mono break-all">{w.address}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {!w.isPrimary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrimary(w.id)}
                    className="text-xs h-8"
                  >
                    Tornar Principal
                  </Button>
                )}
                {wallets.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteWallet(w.id)}
                    className="text-xs h-8 text-red-400 hover:text-red-300"
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conexão Rápida com Web3 Providers */}
      <div className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">Conexão Rápida (Provedores Web3)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulateWeb3Connect("MetaMask")}
            className="flex items-center justify-center gap-2 text-xs"
          >
            🦊 MetaMask
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulateWeb3Connect("Coinbase")}
            className="flex items-center justify-center gap-2 text-xs"
          >
            🔵 Coinbase Wallet
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulateWeb3Connect("WalletConnect")}
            className="flex items-center justify-center gap-2 text-xs"
          >
            🔗 WalletConnect
          </Button>
        </div>
      </div>

      {/* Formulário de Adicionar Manualmente */}
      <form onSubmit={handleAddWallet} className="p-6 bg-kurio-surface border border-kurio-border flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase text-kurio-accent">Adicionar Carteira Manualmente</h2>

        {walletError && (
          <p className="text-xs text-red-400 p-2 bg-red-950/40 border border-red-800">{walletError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
            Apelido da Carteira:
            <Input
              placeholder="Ex: Minha Ledger / Cold Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5">
            Rede:
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as any)}
              className="h-10 bg-kurio-bg border border-kurio-border px-3 text-xs text-kurio-text-primary focus:border-kurio-accent focus:outline-none"
            >
              <option value="Ethereum">Ethereum (Mainnet/Sepolia)</option>
              <option value="Polygon">Polygon POS</option>
              <option value="Arbitrum">Arbitrum One</option>
            </select>
          </label>
          <label className="text-xs text-kurio-text-secondary flex flex-col gap-1.5 sm:col-span-2">
            Endereço da Carteira (0x...):
            <Input
              placeholder="0x1234567890abcdef1234567890abcdef12345678"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
        </div>

        <Button type="submit" variant="default" className="w-fit self-end text-xs mt-2">
          Salvar Carteira
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
