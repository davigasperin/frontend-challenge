import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { CartItem, Coupon } from "@/types"

export interface CartQuote {
  subtotalEth: string
  discountEth: string
  gasFeeEth: string
  totalEth: string
  appliedCoupon: Coupon | null
  itemsCount: number
}

export interface CartResponse {
  items: CartItem[]
  quote: CartQuote
}

export function useCartQuery() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await apiClient.get<CartResponse>("/cart")
      return data
    },
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: CartItem) => {
      const { data } = await apiClient.post<CartResponse>("/cart", item)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data)
    },
  })
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      nftId,
      editionNumber,
      quantity,
    }: {
      nftId: string
      editionNumber: number
      quantity: number
    }) => {
      const { data } = await apiClient.patch<CartResponse>("/cart", {
        nftId,
        editionNumber,
        quantity,
      })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data)
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      nftId,
      editionNumber,
    }: {
      nftId: string
      editionNumber: number
    }) => {
      const { data } = await apiClient.delete<CartResponse>(
        `/cart/${nftId}/${editionNumber}`
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data)
    },
  })
}

export function useApplyCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post<{
        coupon: Coupon
        quote: CartQuote
      }>("/cart/coupon", { code })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<{ quote: CartQuote }>("/cart/coupon")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}
