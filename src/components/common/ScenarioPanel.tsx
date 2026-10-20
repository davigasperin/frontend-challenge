import { useState, useEffect } from "react"
import { mockDb } from "@/mocks/db"
import { realtimeClient } from "@/lib/realtime"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ScenarioPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [scenarios, setScenarios] = useState(mockDb.getState().scenarios)
  const [statusMsg, setStatusMsg] = useState("")

  useEffect(() => {
    setScenarios(mockDb.getState().scenarios)
  }, [isOpen])

  const toggleScenario = (key: keyof typeof scenarios) => {
    const nextVal = !scenarios[key]
    mockDb.updateScenarios({ [key]: nextVal })
    setScenarios({ ...scenarios, [key]: nextVal })
  }

  const handleReset = async () => {
    mockDb.resetToKnownState()
    setScenarios(mockDb.getState().scenarios)
    setStatusMsg("Banco mock restaurado!")
    setTimeout(() => setStatusMsg(""), 2000)
  }

  const triggerPriceChange = () => {
    const nfts = mockDb.getNFTs()
    if (nfts.length > 0) {
      const target = nfts[0]
      const newPrice = (parseFloat(target.priceEth) + 0.25).toFixed(2)
      realtimeClient.emitMockNftUpdated(target.id, newPrice, target.stockAvailable)
      setStatusMsg(`Socket: Preço de ${target.name} alterado para ${newPrice} ETH!`)
      setTimeout(() => setStatusMsg(""), 3000)
    }
  }

  return (
    <aside
      aria-label="Painel de controle de simulação de rede e falhas"
      className="fixed bottom-4 right-4 z-50 font-mono text-xs"
    >
      {!isOpen ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="border-kurio-accent bg-kurio-surface/90 text-kurio-accent shadow-lg"
          aria-expanded={false}
          aria-controls="scenario-panel-content"
        >
          ⚙️ Cenários de Teste (MSW)
        </Button>
      ) : (
        <div
          id="scenario-panel-content"
          className="w-80 p-4 bg-kurio-surface border border-kurio-border shadow-2xl flex flex-col gap-3 text-kurio-text-primary"
        >
          <div className="flex items-center justify-between border-b border-kurio-border pb-2">
            <span className="font-bold text-kurio-accent">Controle de Mocks</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-kurio-text-secondary hover:text-kurio-text-primary text-sm p-1"
              aria-label="Fechar painel de cenários de teste"
            >
              ✕
            </button>
          </div>

          {statusMsg && (
            <div className="p-2 bg-kurio-accent/10 border border-kurio-accent/40 text-kurio-accent text-[11px]">
              {statusMsg}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Simular 401 (Sessão Expirada):</span>
              <input
                type="checkbox"
                checked={scenarios.simulateExpiredSession}
                onChange={() => toggleScenario("simulateExpiredSession")}
                className="accent-kurio-accent"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span>Simular Timeout no Pedido:</span>
              <input
                type="checkbox"
                checked={scenarios.simulateTimeout}
                onChange={() => toggleScenario("simulateTimeout")}
                className="accent-kurio-accent"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span>Simular Estoque Esgotado:</span>
              <input
                type="checkbox"
                checked={scenarios.simulateOutOfStock}
                onChange={() => toggleScenario("simulateOutOfStock")}
                className="accent-kurio-accent"
              />
            </label>

            <div className="flex items-center justify-between pt-1">
              <span>Latência Artificial:</span>
              <Badge variant="outline">{scenarios.latencyMs}ms</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-kurio-border">
            <span className="text-[10px] uppercase text-kurio-text-secondary">Ações de Tempo Real</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={triggerPriceChange}
              className="h-8 text-[11px]"
            >
              ⚡ Disparar `nft.updated` (Socket.IO)
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReset}
              className="h-8 text-[11px]"
            >
              ↺ Resetar Dados Conhecidos
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}
