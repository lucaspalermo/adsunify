"use client"

import { useState } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Search, BookOpen } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { cn } from "@/lib/utils"

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.06 },
  }),
}

type Category = "Todos" | "SEO" | "Anuncios" | "Analytics" | "Social Media"

interface Term {
  name: string
  definition: string
  analogy: string
  category: Category
}

const categories: Category[] = ["Todos", "SEO", "Anuncios", "Analytics", "Social Media"]

const terms: Term[] = [
  {
    name: "SEO",
    definition: "Otimizacao para mecanismos de busca. Sao tecnicas para seu site aparecer no Google.",
    analogy: "E como arrumar a vitrine da sua loja para atrair mais clientes",
    category: "SEO",
  },
  {
    name: "CPC",
    definition: "Custo Por Clique. Quanto voce paga cada vez que alguem clica no seu anuncio.",
    analogy: "E como pagar pedagio: cada clique tem um preco",
    category: "Anuncios",
  },
  {
    name: "CTR",
    definition: "Taxa de Cliques. A porcentagem de pessoas que viram e clicaram no seu link.",
    analogy: "E como a taxa de pessoas que param pra olhar sua vitrine",
    category: "Analytics",
  },
  {
    name: "SERP",
    definition: "Pagina de Resultados do Google. A pagina que aparece quando voce pesquisa algo.",
    analogy: "E como a prateleira do supermercado onde os produtos ficam expostos",
    category: "SEO",
  },
  {
    name: "Backlink",
    definition: "Link de outro site apontando para o seu. Quanto mais, melhor para o Google.",
    analogy: "E como uma recomendacao: quanto mais pessoas indicam voce, mais confianca voce passa",
    category: "SEO",
  },
  {
    name: "Palavra-chave",
    definition: "O termo que as pessoas digitam no Google para encontrar algo.",
    analogy: "E como a placa da sua loja: precisa ter as palavras certas",
    category: "SEO",
  },
  {
    name: "Meta Description",
    definition: "O texto que aparece abaixo do titulo do seu site no Google.",
    analogy: "E como o resumo do livro na contracapa",
    category: "SEO",
  },
  {
    name: "Trafego Organico",
    definition: "Visitantes que chegam ao seu site sem voce pagar por anuncios.",
    analogy: "E como clientes que encontram sua loja sozinhos",
    category: "Analytics",
  },
  {
    name: "Trafego Pago",
    definition: "Visitantes que chegam ao seu site atraves de anuncios pagos.",
    analogy: "E como pagar um panfleteiro para trazer gente ate sua loja",
    category: "Anuncios",
  },
  {
    name: "Landing Page",
    definition: "Pagina de destino. A pagina onde o visitante chega apos clicar no seu anuncio.",
    analogy: "E como a porta de entrada da sua loja",
    category: "Anuncios",
  },
  {
    name: "Conversao",
    definition: "Quando um visitante faz a acao desejada (compra, cadastro, contato).",
    analogy: "E como quando o cliente que entrou na loja realmente compra algo",
    category: "Analytics",
  },
  {
    name: "ROI",
    definition: "Retorno Sobre Investimento. Quanto voce ganhou em relacao ao que gastou.",
    analogy: "E como calcular se o dinheiro do panfleto trouxe mais lucro do que custou",
    category: "Analytics",
  },
]

const categoryColors: Record<Category, string> = {
  Todos: "bg-slate-100 text-slate-900 border-slate-300",
  SEO: "bg-violet-500/20 text-violet-600 border-violet-500/30",
  Anuncios: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Analytics: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Social Media": "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

export default function GlossarioPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("Todos")
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      term.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === "Todos" || term.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText>Glossario do Marketing</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Todos os termos explicados de forma simples
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar termo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 backdrop-blur-xl transition-colors"
          />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        className="flex flex-wrap gap-2"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={1}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
              activeCategory === cat
                ? "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_-3px_rgba(139,92,246,0.3)]"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Terms Grid */}
      <LayoutGroup>
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredTerms.map((term, i) => {
              const isExpanded = expandedTerm === term.name

              return (
                <motion.div
                  key={term.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <GlassCard
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedTerm(isExpanded ? null : term.name)
                    }
                    layoutId={`card-${term.name}`}
                    glow={isExpanded}
                    glowColor="rgba(139, 92, 246, 0.1)"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-900">{term.name}</h3>
                      <span
                        className={cn(
                          "shrink-0 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          categoryColors[term.category]
                        )}
                      >
                        {term.category}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {term.definition}
                    </p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="flex items-start gap-2">
                              <BookOpen className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                              <p className="text-sm italic text-violet-300/80 leading-relaxed">
                                &ldquo;{term.analogy}&rdquo;
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Empty state */}
      <AnimatePresence>
        {filteredTerms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Search className="h-10 w-10 text-slate-400 mb-3" />
            <p className="text-slate-500 text-sm">
              Nenhum termo encontrado para &ldquo;{searchQuery}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
