import { Heart } from "lucide-react"
import { useFavoritesQuery, useToggleFavorite } from "@/hooks/useNFTs"
import { cn } from "@/lib/utils"

// Botão de favoritar reutilizável (card do catálogo e página de detalhes)
export function FavoriteButton({
  nftId,
  className,
}: {
  nftId: string
  className?: string
}) {
  const { data: favorites = [] } = useFavoritesQuery()
  const toggleFavorite = useToggleFavorite()

  const isFav = favorites.includes(nftId)

  return (
    <button
      type="button"
      aria-pressed={isFav}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      disabled={toggleFavorite.isPending}
      onClick={(e) => {
        // Impede que o clique navegue quando o botão está dentro do Link do card
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite.mutate(nftId)
      }}
      className={cn(
        "flex items-center justify-center w-9 h-9 bg-kurio-bg/90 border border-kurio-border backdrop-blur-sm transition-colors hover:border-kurio-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kurio-accent",
        isFav && "border-kurio-accent",
        className
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 text-kurio-text-secondary transition-colors",
          isFav && "fill-kurio-accent text-kurio-accent"
        )}
      />
    </button>
  )
}
