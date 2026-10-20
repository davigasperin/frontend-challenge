import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Flame, Sparkles, BookOpen } from "lucide-react"

// Seções complementares da Home requeridas no Figma: Promos & Blog
export function PromosAndBlogSection() {
  const blogPosts = [
    {
      id: "post-1",
      tag: "Guia",
      title: "Como avaliar a raridade e a proveniência de colecionáveis na Ethereum",
      date: "14 Mar 2026",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "post-2",
      tag: "Ecossistema",
      title: "Royalties programáveis e soberania do criador em mercados descentralizados",
      date: "08 Mar 2026",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "post-3",
      tag: "Segurança",
      title: "Melhores práticas para assinatura de transações e guarda de carteiras",
      date: "01 Mar 2026",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=600&auto=format&fit=crop&q=80",
    },
  ]

  return (
    <div className="flex flex-col gap-16 pt-8 border-t border-kurio-border">
      {/* Banner Promocional / Drop Exclusivo */}
      <section className="relative overflow-hidden bg-gradient-to-r from-kurio-surface via-kurio-bg to-kurio-surface border border-kurio-border p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[10px] bg-kurio-accent text-kurio-bg flex items-center gap-1">
              <Flame className="w-3 h-3" /> Drop de Lançamento
            </Badge>
            <span className="text-xs text-kurio-accent font-bold">Taxa Zero no 1º Pedido</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-kurio-text-primary tracking-tight">
            Use o cupom <span className="text-kurio-accent font-mono underline">KURIO10</span> e ganhe 10% OFF
          </h2>
          <p className="text-xs text-kurio-text-secondary leading-relaxed">
            Válido para qualquer edição ou obra da coleção curada. O desconto é calculado em tempo real diretamente no resumo do carrinho com gas otimizado.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link to="/cart" className="w-full md:w-auto">
            <Button size="lg" variant="default" className="w-full md:w-auto text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Resgatar no Carrinho
            </Button>
          </Link>
        </div>
      </section>

      {/* Seção Blog / Diário Kurio */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between border-b border-kurio-border pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-kurio-accent uppercase tracking-widest font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Diário Kurio
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-kurio-text-primary">
              Notícias, Guias e Análises de Mercado
            </h2>
          </div>
          <span className="text-xs text-kurio-text-muted hidden sm:inline font-mono">Edições Semanais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-kurio-surface border border-kurio-border hover:border-kurio-accent transition-all p-4 flex flex-col gap-3 group"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 bg-kurio-bg/90 border border-kurio-border px-2 py-0.5 text-[10px] text-kurio-accent">
                  {post.tag}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-kurio-text-muted font-mono pt-1">
                <span>{post.date}</span>
                <span>{post.readTime} de leitura</span>
              </div>
              <h3 className="text-sm font-bold text-kurio-text-primary group-hover:text-kurio-accent transition-colors leading-snug">
                {post.title}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-kurio-accent font-bold mt-auto pt-2">
                <span>Ler artigo</span>
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
