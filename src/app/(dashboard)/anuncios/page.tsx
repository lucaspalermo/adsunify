"use client"

import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import {
  Megaphone, ArrowRight, ArrowLeft, Copy, Check, Sparkles, Globe, Users,
  Type, Loader2, Wand2, Lightbulb, ExternalLink, Image, Target,
  CheckCircle2,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

type Platform = "google" | "meta"

interface AdHeadline { text: string; chars: number; maxChars: number }
interface AdDescription { text: string; chars: number; maxChars: number }
interface GuideStep { step: number; title: string; instruction: string; copyText?: string }

interface AdResult {
  headlines: AdHeadline[]
  descriptions: AdDescription[]
  targetAudience: string
  keywords: string[]
  imageIdeas: string[]
  platformGuide: GuideStep[]
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000) }}
      className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center gap-1">
      {ok ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
    </button>
  )
}

function CharBadge({ current, max }: { current: number; max: number }) {
  const over = current > max
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
      over ? "bg-red-500/10 text-red-500" : current > max * 0.85 ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
    )}>
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

  // Normalizar URL - aceitar qualquer formato
  function cleanUrl(url: string) {
    let u = url.trim()
    if (!u) return u
    // Remover protocolo pra normalizar
    u = u.replace(/^https?:\/\//, "").replace(/^www\./, "")
    return u
  }

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
      const cleanedUrl = cleanUrl(siteUrl)
      const res = await fetch("/api/ads/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, platform, siteUrl: cleanedUrl, businessName: businessName.trim() || cleanedUrl, product: product.trim() }),
      })
      const data = await res.json()

      const isGoogle = platform === "google"
      const maxH = isGoogle ? 30 : 40
      const maxD = isGoogle ? 90 : 125
      const bName = businessName.trim() || cleanedUrl
      const prod = product.trim() || "nossos produtos"

      const rawHeadlines = data.headlines || data.ad?.headlines || [
        `${bName} - Confira Hoje`,
        `${prod} com Desconto`,
        `${bName} | Site Oficial`,
      ]
      const headlines: AdHeadline[] = rawHeadlines.map((h: string) => {
        const t = h.slice(0, maxH)
        return { text: t, chars: t.length, maxChars: maxH }
      })

      const rawDescs = data.descriptions || data.ad?.descriptions || [
        `${bName} tem ${prod} com os melhores precos. Entrega rapida pra todo Brasil. Aproveite nossas ofertas!`,
        `Procurando ${prod}? Encontre tudo em ${bName}. Qualidade, preco justo e atendimento que voce merece.`,
      ]
      const descriptions: AdDescription[] = rawDescs.map((d: string) => {
        const t = d.slice(0, maxD)
        return { text: t, chars: t.length, maxChars: maxD }
      })

      const targetAudience = data.targetAudience || `Pessoas de 25-55 anos interessadas em ${prod}, no Brasil`
      const keywords = data.keywords || [`comprar ${prod}`, bName, `${prod} online`, `${prod} preco`, `loja ${prod}`]
      const imageIdeas = data.imageIdeas || [
        "Foto profissional do seu produto principal com fundo branco limpo",
        "Foto de uma pessoa usando/aproveitando seu produto ou servico",
        "Imagem com seu logo + a oferta principal (ex: 'Frete Gratis' ou '20% OFF')",
      ]

      const fullUrl = `https://${cleanedUrl}`

      const platformGuide: GuideStep[] = isGoogle ? [
        { step: 1, title: "Acesse o Google Ads", instruction: "Abra o link abaixo e faca login com sua conta Google (a mesma do Gmail). Se nao tem conta no Google Ads, clique em 'Comecar agora' — e gratis criar a conta.", copyText: "https://ads.google.com" },
        { step: 2, title: "Crie uma nova campanha", instruction: "Clique no botao azul '+ Nova campanha'. Na proxima tela, selecione 'Trafego do site' como objetivo. Depois escolha 'Pesquisa' como tipo de campanha." },
        { step: 3, title: "Configure o orcamento diario", instruction: "No campo 'Orcamento diario medio', coloque o valor abaixo. Recomendamos comecar com R$30/dia por 7 dias pra testar.", copyText: "30" },
        { step: 4, title: "Escolha a localizacao", instruction: "Na secao 'Locais', selecione 'Brasil' (ou sua cidade/estado se o negocio e local). Idioma: Portugues." },
        { step: 5, title: "Adicione as palavras-chave", instruction: "Na secao 'Palavras-chave', clique no campo e cole TODAS as palavras abaixo. O Google vai mostrar seu anuncio quando alguem pesquisar essas palavras.", copyText: keywords.join("\n") },
        { step: 6, title: "Cole os TITULOS do anuncio", instruction: `Agora vem a parte mais importante. Na secao 'Anuncios', voce vai ver campos de 'Titulo'. Cole cada titulo que geramos — um em cada campo. ATENCAO: cada titulo tem no maximo ${maxH} caracteres.` },
        { step: 7, title: "Cole as DESCRICOES", instruction: `Nos campos de 'Descricao', cole as descricoes que geramos. Maximo ${maxD} caracteres cada.` },
        { step: 8, title: "Coloque a URL do seu site", instruction: "No campo 'URL final', cole o endereco do seu site abaixo. E pra la que a pessoa vai quando clicar no anuncio.", copyText: fullUrl },
        { step: 9, title: "Revise e publique!", instruction: "Confira se tudo esta certo, clique em 'Publicar campanha'. O Google vai revisar o anuncio (leva ate 24 horas) e depois ele aparece nas pesquisas!" },
      ] : [
        { step: 1, title: "Acesse o Gerenciador de Anuncios da Meta", instruction: "Abra o link abaixo e faca login com sua conta do Facebook. Se nunca criou anuncios, ele vai pedir pra configurar uma conta de anuncios — siga os passos.", copyText: "https://www.facebook.com/adsmanager" },
        { step: 2, title: "Crie uma nova campanha", instruction: "Clique no botao verde '+ Criar'. Escolha o objetivo 'Trafego' se quer levar pessoas pro seu site, ou 'Engajamento' se quer curtidas e comentarios." },
        { step: 3, title: "Defina o publico-alvo", instruction: "Na secao 'Publico', configure quem vai ver seu anuncio. Use a sugestao que a IA criou pra voce (copie abaixo):", copyText: targetAudience },
        { step: 4, title: "Configure o orcamento", instruction: "Selecione 'Orcamento diario' e coloque R$30/dia pra comecar. O Meta vai otimizar sozinho com o tempo.", copyText: "30" },
        { step: 5, title: "Escolha onde o anuncio aparece", instruction: "Em 'Posicionamentos', deixe em 'Posicionamentos automaticos' (Advantage+). O sistema decide se mostra no Feed, Stories, Reels, etc." },
        { step: 6, title: "Suba a IMAGEM do anuncio", instruction: "Clique em 'Adicionar midia' e suba uma foto do seu produto. DICA IMPORTANTE: use imagem 1080x1080px (quadrada) ou 1200x628px. Evite colocar muito texto na imagem — o Facebook reduz o alcance." },
        { step: 7, title: "Cole o texto principal", instruction: "No campo 'Texto principal', cole a primeira descricao que geramos (veja acima nos resultados). Esse e o texto que aparece em cima da imagem." },
        { step: 8, title: "Cole o titulo e a URL", instruction: "No campo 'Titulo', cole o primeiro titulo gerado. No campo 'URL do site', cole o link abaixo.", copyText: fullUrl },
        { step: 9, title: "Revise e publique!", instruction: "Clique em 'Publicar'. A Meta vai revisar (leva ate 24h) e seu anuncio vai ao ar no Facebook e Instagram!" },
      ]

      setResult({ headlines, descriptions, targetAudience, keywords, imageIdeas, platformGuide })
    } catch (err) {
      console.error("Ad generation error:", err)
    }
    setGenerating(false)
    setStep(3)
  }

  const genSteps = ["Analisando seu site...", "Identificando publico-alvo...", "Criando anuncios otimizados...", "Montando guia passo a passo...", "Pronto!"]

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Criar Anuncio</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          A IA cria o anuncio perfeito e te mostra exatamente onde colar cada coisa
        </p>
      </motion.div>

      {/* ====== STEP 0: Informacoes do negocio ====== */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-1">Me conta sobre seu negocio</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">Preencha o que puder — a IA usa essas informacoes pra criar o melhor anuncio possivel.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                  Endereco do seu site, Instagram ou TikTok *
                </label>
                <input type="text" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} autoFocus
                  placeholder="Pode ser: meusite.com.br, www.meusite.com.br, https://meusite.com.br ou @meuperfil"
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" />
                <p className="text-[11px] text-slate-400 mt-1">Aceita qualquer formato: com ou sem www, com ou sem https://</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Nome do negocio</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ex: Closet da Pie, Studio Fitness Premium"
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">O que voce vende?</label>
                <input type="text" value={product} onChange={e => setProduct(e.target.value)}
                  placeholder="Ex: Roupas femininas, Treino personalizado, Doces artesanais"
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <GlowButton onClick={() => setStep(1)} disabled={!siteUrl.trim()}>
                Proximo <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ====== STEP 1: Escolher plataforma ====== */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-1">Onde voce quer anunciar?</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
              Nao sabe qual escolher? Se voce tem um site e quer que as pessoas te encontrem no Google, escolha Google Ads.
              Se voce quer mostrar seus produtos no Instagram/Facebook, escolha Meta Ads.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button onClick={() => setPlatform("google")}
                className={cn("flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                  platform === "google" ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:border-slate-300"
                )}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-green-500">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-zinc-100">Google Ads</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">Seu anuncio aparece quando alguem pesquisa no Google. Perfeito pra quem tem site.</span>
                <span className="text-[10px] text-indigo-500 font-semibold">Recomendado pra: lojas online, servicos, profissionais</span>
              </button>

              <button onClick={() => setPlatform("meta")}
                className={cn("flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all",
                  platform === "meta" ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10" : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:border-slate-300"
                )}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-zinc-100">Meta Ads</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">Seu anuncio aparece no feed do Facebook e Instagram com foto/video. Otimo pra produtos visuais.</span>
                <span className="text-[10px] text-indigo-500 font-semibold">Recomendado pra: moda, beleza, comida, decoracao</span>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
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

      {/* ====== STEP 2: Gerando ====== */}
      {step === 2 && generating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-6">Criando seu anuncio profissional...</h2>
          <div className="w-full max-w-sm space-y-3">
            {genSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < genStep ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                 i === genStep ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" /> :
                 <div className="h-5 w-5 rounded-full border-2 border-zinc-700" />}
                <span className={cn("text-sm", i <= genStep ? "text-slate-900 dark:text-zinc-200" : "text-slate-400 dark:text-zinc-600")}>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ====== STEP 3: Resultado completo ====== */}
      {step === 3 && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Titulos */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Type className="h-4 w-4 text-indigo-500" /> Titulos do Anuncio (copie e cole no {platform === "google" ? "Google Ads" : "Meta Ads"})
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
              Cada titulo precisa ter no maximo {result.headlines[0]?.maxChars} caracteres. O contador do lado mostra se esta OK.
            </p>
            <div className="space-y-2">
              {result.headlines.map((h, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-3 py-2.5">
                  <span className="flex-1 text-sm text-slate-900 dark:text-zinc-100 font-medium">{h.text}</span>
                  <CharBadge current={h.chars} max={h.maxChars} />
                  <CopyBtn text={h.text} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Descricoes */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Type className="h-4 w-4 text-violet-500" /> Descricoes (copie e cole)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Maximo {result.descriptions[0]?.maxChars} caracteres cada.</p>
            <div className="space-y-2">
              {result.descriptions.map((d, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-3 py-2.5">
                  <span className="flex-1 text-sm text-slate-900 dark:text-zinc-100 leading-relaxed">{d.text}</span>
                  <CharBadge current={d.chars} max={d.maxChars} />
                  <CopyBtn text={d.text} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Publico-alvo + Keywords */}
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-5" hover={false}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-500" /> Publico-alvo sugerido pela IA
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-300 mb-2">{result.targetAudience}</p>
              <CopyBtn text={result.targetAudience} />
            </GlassCard>

            <GlassCard className="p-5" hover={false}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" /> Palavras-chave (cole no Google Ads)
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {result.keywords.map((kw, i) => (
                  <span key={i} className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs text-green-600 dark:text-green-400">{kw}</span>
                ))}
              </div>
              <CopyBtn text={result.keywords.join("\n")} />
            </GlassCard>
          </div>

          {/* Imagens */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Image className="h-4 w-4 text-pink-500" /> Sugestoes de Imagem pro Anuncio
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
              Tire fotos do seu produto/servico ou use fotos profissionais. Tamanho ideal: 1080x1080px (quadrada).
              <strong className="text-amber-500"> EVITE colocar texto na imagem</strong> — o Facebook e Google reduzem o alcance.
            </p>
            <div className="space-y-2">
              {result.imageIdeas.map((idea, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-pink-500/5 border border-pink-500/10 px-3 py-2 text-sm text-slate-700 dark:text-zinc-300">
                  <span className="text-pink-500 font-bold shrink-0">{i + 1}.</span>
                  {idea}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ====== GUIA PASSO A PASSO ====== */}
          <GlassCard className="p-6 border-2 border-indigo-500/20 bg-indigo-500/[0.02]" hover={false}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Agora vamos publicar! Siga passo a passo:
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">
              Faca cada passo na ordem. Onde tiver botao &quot;Copiar&quot;, clique e cole direto no campo indicado.
            </p>

            <div className="space-y-4">
              {result.platformGuide.map((g) => (
                <div key={g.step} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                      {g.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{g.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">{g.instruction}</p>
                      {g.copyText && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 px-3 py-2">
                          <pre className="flex-1 text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-wrap font-mono break-all">{g.copyText}</pre>
                          <CopyBtn text={g.copyText} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <a href={platform === "google" ? "https://ads.google.com" : "https://www.facebook.com/adsmanager"} target="_blank" rel="noopener noreferrer">
                <GlowButton>
                  <ExternalLink className="h-4 w-4" /> Abrir {platform === "google" ? "Google Ads" : "Gerenciador de Anuncios"} agora
                </GlowButton>
              </a>
            </div>
          </GlassCard>

          {/* Voltar */}
          <div className="flex justify-center pt-4">
            <button onClick={() => { setStep(0); setResult(null); setPlatform(null) }}
              className="text-sm text-indigo-500 hover:underline">
              Criar outro anuncio
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function AnunciosPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}><AnunciosContent /></Suspense>
}
