import { Link, useRouterState, useNavigate } from "@tanstack/react-router"
import { KurioLogo } from "@/components/common/KurioLogo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, User as UserIcon, Search, Heart } from "lucide-react"
import { mockDb } from "@/mocks/db"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/common/AuthModal"

export function Header() {
  const routerState = useRouterState()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(mockDb.getCurrentUser())
  const [authOpen, setAuthOpen] = useState(false)

  // Atualiza contadores locais
  useEffect(() => {
    const updateHeaderState = () => {
      const cart = mockDb.getCart()
      const total = cart.reduce((acc, item) => acc + item.quantity, 0)
      setCartCount(total)
      setCurrentUser(mockDb.getCurrentUser())
    }

    updateHeaderState()
    const interval = setInterval(updateHeaderState, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-kurio-border bg-kurio-bg/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <KurioLogo />
        </Link>

        {/* Links de navegação desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider font-mono">
          <Link
            to="/"
            className={`transition-colors hover:text-kurio-accent ${
              routerState.location.pathname === "/" ? "text-kurio-accent font-bold" : "text-kurio-text-secondary"
            }`}
          >
            Explorar
          </Link>
          <Link
            to="/profile"
            className={`transition-colors hover:text-kurio-accent ${
              routerState.location.pathname === "/profile" ? "text-kurio-accent font-bold" : "text-kurio-text-secondary"
            }`}
          >
            Colecionador
          </Link>
          <Link
            to="/wallets"
            className={`transition-colors hover:text-kurio-accent ${
              routerState.location.pathname === "/wallets" ? "text-kurio-accent font-bold" : "text-kurio-text-secondary"
            }`}
          >
            Carteiras
          </Link>
        </nav>

        {/* Ações (Carrinho, Favoritos e Perfil/Login) */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            search={{ search: "" }}
            className="p-2 text-kurio-text-secondary hover:text-kurio-text-primary transition-colors hidden sm:flex"
            aria-label="Buscar NFTs"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            to="/cart"
            className="relative p-2.5 bg-kurio-surface border border-kurio-border text-kurio-text-primary hover:border-kurio-accent hover:text-kurio-accent transition-colors flex items-center justify-center"
            aria-label={`Carrinho com ${cartCount} itens`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] bg-kurio-accent text-kurio-bg font-bold border-none"
              >
                {cartCount}
              </Badge>
            )}
          </Link>

          {currentUser ? (
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 p-2 px-3 bg-kurio-surface border border-kurio-border text-xs font-mono text-kurio-text-primary hover:border-kurio-accent transition-colors"
            >
              <UserIcon className="w-4 h-4 text-kurio-accent" />
              <span>{currentUser.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => setAuthOpen(true)}
                className="text-xs"
              >
                Conectar
              </Button>
              <AuthModal open={authOpen} setOpen={setAuthOpen} />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
