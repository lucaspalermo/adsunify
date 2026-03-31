"use client"

import { useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Megaphone, ArrowRight, ArrowLeft, Copy, Check, Sparkles, Globe, Users,
  Type, Loader2, Wand2, Lightbulb, ExternalLink, Image, Target,
  DollarSign, AlertTriangle, CheckCircle2,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

type Platform = "google" | "meta"

interface AdResult {
  headlines: { text: string; chars: number; maxChars: number }[]
  descriptions: { text: string; chars: number; maxChars: number }[]
  targetAudience: string
  keywords: string[]
  negativeKeywords: string[]
  imageIdeas: string[]
  budget: string
  platformGuide: { step: number; title: string; instruction: string; copyText?: string }[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500 transition-all">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

function CharCount({ current, max }: { current: number; max: number }) {
  const over = current > max
  return (
    <span className={cn("text-[10px] font-mono shrink-0", over ? "text-red-500 font-bold" : current > max * 0.9 ? "text-amber-500" : "text-slate-400")}>
      {current}/{max}
    </span>
  )
}

function AnunciosContent() {
  const userId = useUserId()
  const [step, setStep] = useState(0)
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [siteUrl, setSiteUrl] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [product, setProduct] = useState("")
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<AdResult | null>(null)
  const [genStep, setGenStep] = useState(0)

  async function generateAd() {
    if (!platform || !siteUrl.trim() || !userId) return
    setGenerating(true)
    setStep(2)

    const steps = ["Analisando seu site...", "Identificando publico-alvo...", "Criando anuncios otimizados...", "Montando guia passo a passo...", "Pronto!"]
    for (let i = 0; i < steps.length; i++) {
      setGenStep(i)
      await new Promise(r => setTimeout(r, 1200))
    }

    try {
      const res = await fetch("/api/ads/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          platform,
          siteUrl: siteUrl.trim(),
          businessName: businessName.trim(),
          product: product.trim(),
        }),
      })
      const data = await res.json()

      // Parse AI response or use fallback
      const isGoogle = platform === "google"
      const maxH = isGoogle ? 30 : 40
      const maxD = isGoogle ? 90 : 125

      const headlines = (data.headlines || data.ad?.headlines || [
        `${businessName || "Seu Negocio"} - Ofertas Hoje`,
        `${product || "Produtos"} com Desconto`,
        `Compre Agora | ${businessName || "Site Oficial"}`,
      ]).map((h: string) => ({ text: h.slice(0, maxH), chars: Math.min(h.length, maxH), maxChars: maxH }))

      const descriptions = (data.descriptions || data.ad?.descriptions || [
        `${businessName} tem ${product} com os melhores precos. Entrega rapida e pagamento facilitado. Aproveite!`,
        `Procurando ${product}? ${businessName} oferece qualidade e preco justo. Visite nosso site e confira.`,
      ]).map((d: string) => ({ text: d.slice(0, maxD), chars: Math.min(d.length, maxD), maxChars: maxD }))

      const guide = isGoogle ? [
        { step: 1, title: "Acesse o Google Ads", instruction: "Abra o site ads.google.com e faca login com sua conta Google. Se nao tem conta, clique em 'Comecar agora' e siga os passos." },
        { step: 2, title: "Crie uma nova campanha", instruction: "Clique no botao azul '+ Nova campanha'. Escolha 'Pesquisa' como tipo de campanha." },
        { step: 3, title: "Escolha o objetivo", instruction: "Selecione 'Trafego do site' (ou 'Vendas' se vende online). Depois clique em 'Continuar'." },
        { step: 4, title: "Configure o orcamento", instruction: `Defina o orcamento diario. Recomendamos comecar com R$${data.budget || "30"}/dia pra testar. Voce pode mudar depois.`, copyText: data.budget || "30" },
        { step: 5, title: "Adicione as palavras-chave", instruction: "Na secao 'Palavras-chave', cole as palavras abaixo. Sao as palavras que as pessoas buscam no Google pra encontrar seu negocio.", copyText: (data.keywords || ["comprar " + product, businessName, product + " preco"]).join("\n") },
        { step: 6, title: "Cole os titulos do anuncio", instruction: `Na secao 'Titulos', voce tem 15 campos. Cole os titulos que geramos (maximo ${maxH} caracteres cada). Copie um por um clicando no botao ao lado.` },
        { step: 7, title: "Cole as descricoes", instruction: `Na secao 'Descricoes', cole as descricoes que geramos (maximo ${maxD} caracteres cada).` },
        { step: 8, title: "Adicione a URL do site", instruction: "No campo 'URL final', cole o endereco do seu site.", copyText: siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}` },
        { step: 9, title: "Revise e publique", instruction: "Confira tudo e clique em 'Publicar campanha'. O Google vai revisar em ate 24h e seu anuncio vai ao ar!" },
      ] : [
        { step: 1, title: "Acesse o Gerenciador de Anuncios", instruction: "Abra business.facebook.com e va em 'Gerenciador de Anuncios'. Se nao tem conta, crie uma Business Suite primeiro." },
        { step: 2, title: "Crie uma nova campanha", instruction: "Clique em '+ Criar'. Escolha o objetivo 'Trafego' (ou 'Vendas' se tem loja online)." },
        { step: 3, title: "Defina o publico", instruction: `Na secao 'Publico', defina: ${data.targetAudience || "Idade 25-55, Brasil, interesses relacionados a " + product}`, copyText: data.targetAudience },
        { step: 4, title: "Configure o orcamento", instruction: `Defina R$${data.budget || "30"}/dia como orcamento diario. Escolha 'Orcamento diario' e nao 'vitalicio'.`, copyText: data.budget || "30" },
        { step: 5, title: "Crie o anuncio — Texto principal", instruction: "Na secao 'Criativo', cole o texto principal abaixo no campo 'Texto principal'." },
        { step: 6, title: "Adicione a imagem", instruction: "Suba uma foto profissional do seu produto/servico. Tamanho ideal: 1080x1080px (quadrada) ou 1200x628px (paisagem). Evite texto na imagem (o Facebook penaliza)." },
        { step: 7, title: "Cole o titulo e descricao", instruction: "Preencha 'Titulo' e 'Descricao' com os textos que geramos." },
        { step: 8, title: "Adicione o link do site", instruction: "No campo 'URL do site', cole o endereco do seu site.", copyText: siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}` },
        { step: 9, title: "Publique", instruction: "Clique em 'Publicar'. O Meta vai revisar em ate 24h." },
      ]

      setResult({
        headlines,
        descriptions,
        targetAudience: data.targetAudience || `Pessoas de 25-55 anos interessadas em ${product}`,
        keywords: data.keywords || ["comprar " + product, businessName, product + " preco", product + " online"],
        negativeKeywords: data.negativeKeywords || ["gratis", "emprego", "curso"],
        imageIdeas: data.imageIdeas || [
          "Foto profissional do produto principal com fundo limpo",
          "Foto de um cliente satisfeito usando o produto/servico",
          "Imagem com o logo + oferta principal em destaque",
        ],
        budget: data.budget || "30",
        platformGuide: guide,
      })
    } catch {
      // fallback handled above
    }
    setGenerating(false)
    setStep(3)
  }

  const genSteps = ["Analisando seu site...", "Identificando publico-alvo...", "Criando anuncios otimizados...", "Montando guia passo a passo...", "Pronto!"]

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <motion.div {...fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Criar Anuncio</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          A IA cria o anuncio perfeito e te mostra exatamente onde colar cada coisa
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 0: Informacoes */}
        {step === 0 && (
          <motion.div key="s0" {...fadeIn} className="space-y-4">
            <GlassCard className="p-5" hover={false}>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">Me conta sobre seu negocio</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Endereco do seu site ou perfil *</label>
                  <input type="text" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} autoFocus
                    placeholder="meusite.com.br ou @meuperfil"
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" />
                  <p className="text-[11px] text-slate-400 mt-1">A IA vai analisar seu site/perfil pra criar o anuncio ideal</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Nome do negocio</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    placeholder="Ex: Studio Fitness Premium"
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">O que voce vende? (produto ou servico)</label>
                  <input type="text" value={product} onChange={e => setProduct(e.target.value)}
                    placeholder="Ex: Treino personalizado pra mulheres"
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50" />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <GlowButton onClick={() => setStep(1)} disabled={!siteUrl.trim()}>
                  Proximo <ArrowRight className="h-4 w-4" />
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Step 1: Plataforma */}
        {step === 1 && (
          <motion.div key="s1" {...fadeIn} className="space-y-4">
            <GlassCard className="p-5" hover={false}>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-1">Onde voce quer anunciar?</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">Nao sabe? O Google Ads e melhor pra quem ja tem site. O Meta Ads (Facebook/Instagram) e melhor pra quem quer divulgar produto visual.</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "google" as Platform, name: "Google Ads", desc: "Aparece quando alguem pesquisa no Google", best: "Melhor pra: sites, servicos, lojas online", color: "from-blue-500 to-green-500" },
                  { id: "meta" as Platform, name: "Meta Ads", desc: "Aparece no feed do Facebook e Instagram", best: "Melhor pra: produtos visuais, marcas, perfis", color: "from-blue-500 to-purple-500" },
                ].map(p => (
                  <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                      platform === p.id ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:border-slate-300"
                    )}>
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", p.color)}>
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-base font-bold text-slate-900 dark:text-zinc-100">{p.name}</span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{p.desc}</p>
                      <p className="text-[10px] text-indigo-500 mt-1 font-medium">{p.best}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
                <GlowButton onClick={generateAd} disabled={!platform}>
                  <Wand2 className="h-4 w-4" /> Gerar meu anuncio com IA
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Step 2: Gerando */}
        {step === 2 && generating && (
          <motion.div key="s2" {...fadeIn} className="flex flex-col items-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-6">Criando seu anuncio profissional...</h2>
            <div className="w-full max-w-sm space-y-3">
              {genSteps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= genStep ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3">
                  {i < genStep ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                   i === genStep ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" /> :
                   <div className="h-5 w-5 rounded-full border border-zinc-700" />}
                  <span className={cn("text-sm", i <= genStep ? "text-slate-900 dark:text-zinc-200" : "text-slate-400 dark:text-zinc-600")}>{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Resultado completo */}
        {step === 3 && result && (
          <motion.div key="s3" {...fadeIn} className="space-y-5">
            {/* Titulos */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                <Type className="h-4 w-4 text-indigo-500" /> Titulos do Anuncio
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Cada titulo tem que ter no maximo {result.headlines[0]?.maxChars} caracteres. Copie e cole no {platform === "google" ? "Google Ads" : "Gerenciador de Anuncios"}.</p>
              <div className="space-y-2">
                {result.headlines.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-3 py-2.5">
                    <span className="flex-1 text-sm text-slate-900 dark:text-zinc-100 font-medium">{h.text}</span>
                    <CharCount current={h.chars} max={h.maxChars} />
                    <CopyButton text={h.text} />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Descricoes */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                <Type className="h-4 w-4 text-violet-500" /> Descricoes do Anuncio
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Maximo {result.descriptions[0]?.maxChars} caracteres cada.</p>
              <div className="space-y-2">
                {result.descriptions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-3 py-2.5">
                    <span className="flex-1 text-sm text-slate-900 dark:text-zinc-100 leading-relaxed">{d.text}</span>
                    <CharCount current={d.chars} max={d.maxChars} />
                    <CopyButton text={d.text} />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Publico-alvo + Keywords */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard className="p-5" hover={false}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-500" /> Publico-alvo sugerido
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-300">{result.targetAudience}</p>
                <CopyButton text={result.targetAudience} />
              </GlassCard>

              <GlassCard className="p-5" hover={false}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" /> Palavras-chave
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs text-green-600 dark:text-green-400">{kw}</span>
                  ))}
                </div>
                <CopyButton text={result.keywords.join("\n")} />
              </GlassCard>
            </div>

            {/* Ideias de imagem */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                <Image className="h-4 w-4 text-pink-500" /> Ideias de Imagem pro Anuncio
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Use fotos de boa qualidade. Evite textos na imagem (o Facebook/Google penaliza).</p>
              <div className="space-y-2">
                {result.imageIdeas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300">
                    <span className="mt-0.5 text-pink-500 font-bold text-xs">{i + 1}.</span>
                    {idea}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* GUIA PASSO A PASSO */}
            <GlassCard className="p-5 border-2 border-indigo-500/20" hover={false}>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" /> Guia Passo a Passo — Como Publicar
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                Siga cada passo na ordem. Se travar em algum, pergunte pro Co-Piloto IA.
              </p>

              <div className="space-y-4">
                {result.platformGuide.map((g) => (
                  <div key={g.step} className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                        {g.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{g.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{g.instruction}</p>
                        {g.copyText && (
                          <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-zinc-800 px-3 py-2">
                            <pre className="flex-1 text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">{g.copyText}</pre>
                            <CopyButton text={g.copyText} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Link direto */}
              <div className="mt-4 flex justify-center">
                <a href={platform === "google" ? "https://ads.google.com" : "https://business.facebook.com/adsmanager"} target="_blank" rel="noopener noreferrer">
                  <GlowButton>
                    <ExternalLink className="h-4 w-4" /> Abrir {platform === "google" ? "Google Ads" : "Gerenciador de Anuncios"} agora
                  </GlowButton>
                </a>
              </div>
            </GlassCard>

            {/* Voltar pra criar outro */}
            <div className="flex justify-center">
              <button onClick={() => { setStep(0); setResult(null); setPlatform(null) }}
                className="text-sm text-indigo-500 hover:underline">
                Criar outro anuncio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AnunciosPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}><AnunciosContent /></Suspense>
}
