"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Send, Trophy, Tag, Loader2, Plus, User } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  title: string
  body: string
  category: string
  likes: number
  commentCount: number
  createdAt: string
  author: { name: string; level: number }
}

interface RankUser {
  id: string
  name: string
  xp: number
  level: number
}

const categories = ["Todos", "Cases", "Duvidas", "Dicas", "Celebracoes"]

export default function ComunidadePage() {
  const userId = useUserId()
  const [posts, setPosts] = useState<Post[]>([])
  const [ranking, setRanking] = useState<RankUser[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("Todos")
  const [newPost, setNewPost] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/community/posts").then(r => r.json()).catch(() => []),
      fetch("/api/community/ranking").then(r => r.json()).catch(() => []),
    ]).then(([postsData, rankData]) => {
      setPosts(Array.isArray(postsData) ? postsData : postsData.posts || [])
      setRanking(Array.isArray(rankData) ? rankData : rankData.ranking || [])
    }).finally(() => setLoading(false))
  }, [])

  async function createPost() {
    if (!newTitle.trim() || !newPost.trim() || !userId) return
    try {
      await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title: newTitle, body: newPost, category: category === "Todos" ? "Dicas" : category }),
      })
      setNewTitle("")
      setNewPost("")
      setShowForm(false)
      // Refresh
      const res = await fetch("/api/community/posts").then(r => r.json())
      setPosts(Array.isArray(res) ? res : res.posts || [])
    } catch {}
  }

  async function likePost(postId: string) {
    if (!userId) return
    await fetch("/api/community/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId }),
    })
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
  }

  const filtered = category === "Todos" ? posts : posts.filter(p => p.category === category)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
            <GradientText as="span">Comunidade</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Troque experiencias com outros empreendedores</p>
        </div>
        <GlowButton onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Nova publicacao
        </GlowButton>
      </motion.div>

      {/* New post form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <GlassCard className="p-5" hover={false}>
            <input type="text" placeholder="Titulo da publicacao" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50 mb-3" />
            <textarea placeholder="Compartilhe sua experiencia, duvida ou dica..." value={newPost} onChange={e => setNewPost(e.target.value)} rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50 resize-none mb-3" />
            <GlowButton onClick={createPost} disabled={!newTitle.trim() || !newPost.trim()}>
              <Send className="h-4 w-4" /> Publicar
            </GlowButton>
          </GlassCard>
        </motion.div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            category === cat ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          )}>{cat}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Posts */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : filtered.length === 0 ? (
            <GlassCard className="p-8 text-center" hover={false}>
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">Nenhuma publicacao ainda</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Seja o primeiro a compartilhar!</p>
            </GlassCard>
          ) : (
            filtered.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-500">
                      {post.author?.name?.[0] || "U"}
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{post.author?.name || "Usuario"}</span>
                    <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-500">Lv{post.author?.level || 1}</span>
                    <span className="ml-auto text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">{post.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3">{post.body}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <button onClick={() => likePost(post.id)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      <Heart className="h-3.5 w-3.5" /> {post.likes}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-slate-500">{post.category}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>

        {/* Ranking */}
        <div>
          <GlassCard className="p-5 sticky top-20" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Ranking
            </h3>
            {ranking.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">Ranking sera preenchido com usuarios ativos</p>
            ) : (
              <div className="space-y-2">
                {ranking.slice(0, 10).map((user, i) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                    )}>{i + 1}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex-1 truncate">{user.name}</span>
                    <span className="text-[10px] text-amber-500 font-medium">{user.xp} XP</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
