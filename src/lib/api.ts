import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

// Cliente HTTP configurado com base nas diretrizes do README
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Gerador simples de chaves de idempotência (UUID v4 simplificado)
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Interceptor de requisição: injeta token de autenticação se disponível
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("kurio_auth_token") : null
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Ignora falhas em ambientes sem localStorage
    }
    return config
  },
  (error: unknown) => Promise.reject(error)
)

// Interceptor de resposta: normalização de erros amigáveis
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || "Ocorreu um erro inesperado."

    // Dispara evento para logout global se receber 401
    if (status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kurio:unauthorized"))
    }

    return Promise.reject({
      status,
      message,
      originalError: error,
    })
  }
)
