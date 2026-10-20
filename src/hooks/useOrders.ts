import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, generateIdempotencyKey } from "@/lib/api"
import type { Order, Wallet } from "@/types"

export interface CreateOrderPayload {
  walletAddress: string
  network: string
  idempotencyKey?: string
}

export function useWalletsQuery() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data } = await apiClient.get<Wallet[]>("/wallets")
      return data
    },
  })
}

export function useOrderQuery(orderId?: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null
      const { data } = await apiClient.get<Order>(`/orders/${orderId}`)
      return data
    },
    enabled: Boolean(orderId),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      walletAddress,
      network,
      idempotencyKey,
    }: CreateOrderPayload) => {
      const key = idempotencyKey || generateIdempotencyKey()
      const { data } = await apiClient.post<Order>(
        "/orders",
        { walletAddress, network },
        {
          headers: {
            "Idempotency-Key": key,
          },
        }
      )
      return data
    },
    onSuccess: (order) => {
      queryClient.setQueryData(["order", order.id], order)
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}
