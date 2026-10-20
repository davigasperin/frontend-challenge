import { Link, useRouterState } from "@tanstack/react-router"
import { Home, Search, ShoppingBag, Wallet, User } from "lucide-react"
import { mockDb } from "@/mocks/db"
import { Badge } from "@/components/ui/badge"
import { useCartQuery } from "@/hooks/useCart"

export function MobileTabBar() {
  const routerState = useRouterState()
  const { data: cartData } = useCartQuery()

  const cartCount = cartData?.quote?.itemsCount ?? mockDb.getCart().reduce((acc, item) => acc + item.quantity, 0)

  const currentPath = routerState.location.pathname

  const navItems = [
    { label: "Início", path: "/", icon: Home },
    { label: "Buscar", path: "/?search=", icon: Search, search: { search: "" } },
    { label: "Carrinho", path: "/cart", icon: ShoppingBag, count: cartCount },
    { label: "Carteiras", path: "/wallets", icon: Wallet },
    { label: "Perfil", path: "/profile", icon: User },
  ]

  return (
    <nav
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-kurio-bg/95 border-t border-kurio-border backdrop-blur-md px-3 py-2 flex items-center justify-around"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.path === "/" ? currentPath === "/" : currentPath.startsWith(item.path.replace(/\?.*$/, ""))

        return (
          <Link
            key={item.label}
            to={item.path as any}
            search={item.search as any}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono transition-colors relative ${
              isActive ? "text-kurio-accent font-bold" : "text-kurio-text-muted hover:text-kurio-text-primary"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {Boolean(item.count && item.count > 0) && (
                <Badge
                  variant="default"
                  className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 text-[9px] bg-kurio-accent text-kurio-bg border-none flex items-center justify-center font-bold"
                >
                  {item.count}
                </Badge>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
