"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Heart,
  MessageCircle,
  Send,
  Trophy,
  Tag,
  Crown,
  Medal,
  Award,
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

const posts: {
  id: number
  avatar: string
  name: string
  level: number
  content: string
  likes: number
  comments: number
  time: string
  color: string
}[] = []

const ranking: {
  name: string
  level: number
  xp: number
  medal: string | null
}[] = []

const categories = ["Cases", "Dúvidas", "Dicas", "Celebrações"]

export default function ComunidadePage() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText as="span">Comunidade AdsUnify</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Conecte-se com outros empreendedores
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* Create Post */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={0}
          >
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white">
                  J
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Compartilhe algo com a comunidade..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500/50"
                    rows={2}
                  />
                  <div className="mt-2 flex justify-end">
                    <GlowButton size="sm">
                      <Send className="h-3.5 w-3.5" />
                      Publicar
                    </GlowButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="show"
              custom={1}
            >
              <GlassCard className="p-5">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                    <MessageCircle className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900/80 mb-2">
                    A comunidade esta comecando!
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Seja o primeiro a postar. Compartilhe suas conquistas, duvidas ou dicas com outros empreendedores!
                  </p>
                </motion.div>
              </GlassCard>
            </motion.div>
          ) : (
            posts.map((post, idx) => (
              <motion.div
                key={post.id}
                variants={sectionVariants}
                initial="hidden"
                animate="show"
                custom={idx + 1}
              >
                <GlassCard className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${post.color}`}
                    >
                      {post.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + Level */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{post.name}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-600">
                          <Crown className="h-3 w-3" />
                          Level {post.level}
                        </span>
                        <span className="text-xs text-slate-400">{post.time}</span>
                      </div>

                      {/* Content */}
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {post.content}
                      </p>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-pink-400"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              likedPosts.has(post.id)
                                ? "fill-pink-400 text-pink-400"
                                : ""
                            }`}
                          />
                          {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-blue-400">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Ranking */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={1}
          >
            <GlassCard className="p-5" hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h2 className="font-semibold text-slate-900">Ranking do Mês</h2>
              </div>
              {ranking.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Nenhum participante ainda. Seja o primeiro!
                </p>
              ) : (
                <div className="space-y-3">
                  {ranking.map((user, idx) => (
                    <motion.div
                      key={user.name}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center text-sm font-bold text-slate-500">
                          {user.medal || `${idx + 1}`}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400">Lv.{user.level}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-violet-600">
                        +{user.xp.toLocaleString("pt-BR")} XP
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Categories */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <GlassCard className="p-5" hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-400" />
                <h2 className="font-semibold text-slate-900">Categorias</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-violet-500/30 hover:text-violet-600"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
