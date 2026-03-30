"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Star,
  Clock,
  ShoppingBag,
  Palette,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

const filterCategories = ["Todos", "Design", "Vídeo", "Desenvolvimento", "Copywriting"]

const services: {
  title: string
  price: string
  rating: number
  reviews: number
  delivery: string
  category: string
  icon: typeof Palette
  color: string
  bg: string
}[] = []

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("Todos")

  const filtered =
    activeFilter === "Todos"
      ? services
      : services.filter((s) => s.category === activeFilter)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText as="span">Marketplace de Serviços</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Encontre profissionais para ajudar seu negócio
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="flex flex-wrap gap-2"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === cat
                ? "border-violet-500/50 bg-violet-500/10 text-violet-600"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Services Grid / Empty State */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={1}
      >
        {filtered.length === 0 ? (
          <GlassCard className="p-6" hover={false}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900/80 mb-2">
                Marketplace em breve!
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Estamos conectando os melhores profissionais de marketing digital para voce. Em breve voce podera contratar servicos diretamente aqui.
              </p>
            </motion.div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
              >
                <GlassCard className="flex h-full flex-col p-6">
                  {/* Icon + Category */}
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.bg}`}
                    >
                      <service.icon className={`h-5 w-5 ${service.color}`} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                      {service.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-sm font-semibold text-slate-900 leading-snug">
                    {service.title}
                  </h3>

                  {/* Rating */}
                  <div className="mb-3 flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.floor(service.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-400"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">
                      {service.rating} ({service.reviews} avaliações)
                    </span>
                  </div>

                  {/* Delivery */}
                  <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Entrega: {service.delivery}
                  </div>

                  {/* Price + Button */}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{service.price}</span>
                    <GlowButton size="sm">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Contratar
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
