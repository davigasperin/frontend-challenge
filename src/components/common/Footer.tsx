import { KurioLogo } from "@/components/common/KurioLogo"
import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <footer className="w-full border-t border-kurio-border bg-kurio-bg pt-12 pb-8 mt-auto text-xs font-mono text-kurio-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-sm">
          <KurioLogo />
          <p className="text-kurio-text-muted leading-relaxed">
            Marketplace de NFTs curado e verificado na blockchain Ethereum. Transparência, royalties garantidos e edições limitadas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-kurio-text-primary uppercase font-bold tracking-wider">Navegação</span>
            <Link to="/" className="hover:text-kurio-accent transition-colors">Explorar</Link>
            <Link to="/cart" className="hover:text-kurio-accent transition-colors">Carrinho</Link>
            <Link to="/wallets" className="hover:text-kurio-accent transition-colors">Carteiras</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-kurio-text-primary uppercase font-bold tracking-wider">Conta</span>
            <Link to="/profile" className="hover:text-kurio-accent transition-colors">Perfil</Link>
            <Link to="/profile" className="hover:text-kurio-accent transition-colors">Segurança</Link>
            <Link to="/profile" className="hover:text-kurio-accent transition-colors">Preferências</Link>
          </div>
          <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
            <span className="text-kurio-text-primary uppercase font-bold tracking-wider">Status Rede</span>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ethereum Sepolia (Mock)</span>
            </div>
            <span className="text-kurio-text-muted text-[11px]">Gas: ~18 Gwei</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 mt-8 border-t border-kurio-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-kurio-text-muted">
        <span>© 2026 KURIO NFT Marketplace. Todos os direitos reservados.</span>
        <span>Frontend Challenge — Conforme especificações do Figma & README</span>
      </div>
    </footer>
  )
}
