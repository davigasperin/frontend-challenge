import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { NFTItem } from "@/types"

export interface CatalogueParams {
  search: string
  category: string
  sort: string
  page: number
}

export interface CatalogueResponse {
  items: NFTItem[]
  total: number
  page: number
  totalPages: number
}

// Catálogo paginado via MSW (respeita latência/falhas simuladas)
export function useCatalogueQuery(params: CatalogueParams) {
  return useQuery({
    queryKey: ["nfts", "catalogue", params],
    queryFn: async () => {
      const { data } = await apiClient.get<CatalogueResponse>("/nfts", { params })
      return data
    },
  })
}

export function useNFTDetailQuery(id: string) {
  return useQuery({
    queryKey: ["nft", id],
    queryFn: async () => {
      const { data } = await apiClient.get<NFTItem>(`/nfts/${id}`)
      return data
    },
    retry: false,
  })
}

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await apiClient.get<string[]>("/favorites")
      return data
    },
  })
}

// Toggle de favorito com atualização otimista (padrão TanStack Query)
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nftId: string) => {
      const { data } = await apiClient.post<{ isFavorite: boolean }>(`/favorites/${nftId}`)
      return data
    },
    onMutate: async (nftId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] })
      const previous = queryClient.getQueryData<string[]>(["favorites"])
      queryClient.setQueryData<string[]>(["favorites"], (old = []) => {
        return old.includes(nftId) ? old.filter((x) => x !== nftId) : [...old, nftId]
      })
      return { previous }
    },
    onError: (_err, _nftId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["favorites"], ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}
