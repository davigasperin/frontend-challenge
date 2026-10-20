import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata valores em ETH mantendo representação como string decimal
 * conforme exigência do enunciado (seção 3 - Carrinho).
 */
export function formatEth(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "0.00 ETH"
  return `${num.toFixed(2)} ETH`
}

/**
 * Encurta endereços de carteira Ethereum para exibição amigável
 * Ex: 0x7A42...19E8
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address || ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
