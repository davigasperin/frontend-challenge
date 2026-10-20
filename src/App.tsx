import React from "react"
import { KurioLogo } from "./components/common/KurioLogo"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Badge } from "./components/ui/badge"
import { Skeleton } from "./components/ui/skeleton"
import { ScenarioPanel } from "./components/common/ScenarioPanel"

export function App() {
  return (
    <main className="min-h-screen bg-kurio-bg text-kurio-text-primary p-6 sm:p-12 max-w-5xl mx-auto flex flex-col gap-8">
      <header className="flex items-center justify-between border-b border-kurio-border pb-6">
        <KurioLogo />
        <div className="flex items-center gap-3">
          <Badge variant="default">Fase 1 OK</Badge>
          <Button size="sm" variant="default">Explorar</Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-kurio-text-primary">
          Seja dono do futuro da arte digital
        </h1>
        <p className="text-kurio-text-secondary text-sm max-w-2xl">
          Descubra NFTs selecionados de criadores do mundo todo e colecione arte digital verificada na Kurio.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mt-4">
          <Input placeholder="Buscar por NFT, artista..." />
          <Button variant="secondary">Buscar</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 pt-6 border-t border-kurio-border">
        <h2 className="text-lg font-bold text-kurio-text-secondary">Shimmer Skeleton Check</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-3 p-4 bg-kurio-surface border border-kurio-border">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex flex-col gap-3 p-4 bg-kurio-surface border border-kurio-border">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex flex-col gap-3 p-4 bg-kurio-surface border border-kurio-border">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </section>

      <ScenarioPanel />
    </main>
  )
}
export default App

