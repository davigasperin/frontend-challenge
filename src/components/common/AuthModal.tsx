import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockDb } from "@/mocks/db"
import { useNavigate } from "@tanstack/react-router"

// Custom zero-dependency resolver for Zod + React Hook Form
function createZodResolver<T extends z.ZodTypeAny>(schema: T) {
  return async (values: any) => {
    const result = schema.safeParse(values)
    if (result.success) {
      return { values: result.data, errors: {} }
    }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join(".")
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message }
      }
    }
    return { values: {}, errors }
  }
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
})

const registerSchema = z.object({
  name: z.string().min(3, "Nome muito curto."),
  email: z.string().email("E-mail inválido."),
  username: z.string().min(3, "Username muito curto."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export function AuthModal({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [authError, setAuthError] = useState("")
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginForm = useForm<LoginFormData>({
    resolver: createZodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: createZodResolver(registerSchema),
    defaultValues: { name: "", email: "", username: "", password: "" },
  })

  const handleLogin = (data: LoginFormData) => {
    setAuthError("")
    const user = mockDb.login(data.email)
    if (!user) {
      setAuthError("E-mail não encontrado ou senha incorreta.")
      return
    }
    // Preserva o carrinho do visitante notificando queries ativas
    queryClient.invalidateQueries({ queryKey: ["cart"] })
    setOpen(false)
    navigate({ to: "/profile" })
  }

  const handleRegister = (data: RegisterFormData) => {
    setAuthError("")
    const existing = mockDb
      .getState()
      .users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
    if (existing) {
      setAuthError("Este e-mail já está cadastrado.")
      return
    }
    mockDb.register(data.name, data.email, data.username)
    setOpen(false)
    navigate({ to: "/profile" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-kurio-accent uppercase text-base tracking-wider">
            {mode === "login" ? "Acessar Conta" : "Criar Conta Kurio"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Faça login para acessar seu perfil e carteiras."
              : "Cadastre-se para começar a colecionar."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {authError && (
            <p className="text-[11px] text-red-400 bg-red-950/40 border border-red-800 p-2">
              {authError}
            </p>
          )}

          {mode === "login" ? (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-kurio-text-secondary" htmlFor="login-email">
                  E-mail
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="voce@email.com"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <span className="text-[10px] text-red-400">
                    {loginForm.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-kurio-text-secondary" htmlFor="login-password">
                  Senha
                </label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <span className="text-[10px] text-red-400">
                    {loginForm.formState.errors.password.message}
                  </span>
                )}
              </div>
              <Button type="submit" className="w-full mt-2">
                Entrar
              </Button>
              <p className="text-[11px] text-center text-kurio-text-muted">
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-kurio-accent hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-kurio-text-secondary" htmlFor="reg-name">
                  Nome completo
                </label>
                <Input
                  id="reg-name"
                  placeholder="Seu nome"
                  {...registerForm.register("name")}
                />
                {registerForm.formState.errors.name && (
                  <span className="text-[10px] text-red-400">
                    {registerForm.formState.errors.name.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-kurio-text-secondary" htmlFor="reg-username">
                  Username
                </label>
                <Input
                  id="reg-username"
                  placeholder="@seuusername"
                  {...registerForm.register("username")}
                />
                {registerForm.formState.errors.username && (
                  <span className="text-[10px] text-red-400">
                    {registerForm.formState.errors.username.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-kurio-text-secondary" htmlFor="reg-email">
                  E-mail
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="voce@email.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <span className="text-[10px] text-red-400">
                    {registerForm.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-kurio-text-secondary" htmlFor="reg-password">
                  Senha
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <span className="text-[10px] text-red-400">
                    {registerForm.formState.errors.password.message}
                  </span>
                )}
              </div>
              <Button type="submit" className="w-full mt-2">
                Criar Conta
              </Button>
              <p className="text-[11px] text-center text-kurio-text-muted">
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-kurio-accent hover:underline"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
