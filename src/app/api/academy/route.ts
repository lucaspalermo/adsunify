import { NextResponse } from "next/server"

// Academy course data (gamified learning)
const COURSES = [
  {
    id: "seo-fundamentals",
    title: "SEO do Zero ao Avancado",
    description: "Aprenda SEO completo: pesquisa de palavras-chave, otimizacao on-page, link building e tecnico.",
    modules: 8,
    duration: "4 horas",
    level: "iniciante",
    xpReward: 500,
    badge: "SEO Master",
    topics: [
      { title: "O que e SEO e por que importa", duration: "15min", xp: 50 },
      { title: "Pesquisa de palavras-chave", duration: "30min", xp: 75 },
      { title: "SEO On-Page (titulo, meta, H1)", duration: "30min", xp: 75 },
      { title: "SEO Tecnico (sitemap, robots, speed)", duration: "30min", xp: 75 },
      { title: "Conteudo otimizado para Google", duration: "30min", xp: 75 },
      { title: "Link Building estrategico", duration: "30min", xp: 75 },
      { title: "SEO Local para negocios", duration: "30min", xp: 50 },
      { title: "Medindo resultados com GSC", duration: "15min", xp: 25 },
    ],
  },
  {
    id: "google-ads-101",
    title: "Google Ads para Iniciantes",
    description: "Crie suas primeiras campanhas no Google Ads com orcamento baixo e resultados reais.",
    modules: 6,
    duration: "3 horas",
    level: "iniciante",
    xpReward: 400,
    badge: "Google Ads Starter",
    topics: [
      { title: "Configurando sua conta Google Ads", duration: "20min", xp: 50 },
      { title: "Tipos de campanha (Search, Display, Shopping)", duration: "25min", xp: 75 },
      { title: "Pesquisa de palavras-chave para ads", duration: "25min", xp: 75 },
      { title: "Escrevendo anuncios que convertem", duration: "30min", xp: 75 },
      { title: "Configurando conversoes e tracking", duration: "25min", xp: 75 },
      { title: "Otimizando com metricas (CPC, CTR, CPA)", duration: "15min", xp: 50 },
    ],
  },
  {
    id: "meta-ads-101",
    title: "Meta Ads (Facebook + Instagram)",
    description: "Domine anuncios no Facebook e Instagram: publico, criativos, retargeting.",
    modules: 7,
    duration: "3.5 horas",
    level: "iniciante",
    xpReward: 450,
    badge: "Meta Ads Pro",
    topics: [
      { title: "Configurando Business Manager e Pixel", duration: "20min", xp: 50 },
      { title: "Estrutura de campanhas (CBO vs ABO)", duration: "25min", xp: 75 },
      { title: "Criando publicos (interest, lookalike, custom)", duration: "30min", xp: 75 },
      { title: "Criativos que vendem (imagem, video, carrossel)", duration: "30min", xp: 75 },
      { title: "Copywriting para social ads", duration: "25min", xp: 75 },
      { title: "Retargeting e funil de vendas", duration: "25min", xp: 50 },
      { title: "Escalando campanhas vencedoras", duration: "15min", xp: 50 },
    ],
  },
  {
    id: "content-marketing",
    title: "Marketing de Conteudo",
    description: "Estrategia completa de conteudo: blog, social, video, email. Gere trafego organico.",
    modules: 6,
    duration: "3 horas",
    level: "intermediario",
    xpReward: 400,
    badge: "Content Creator",
    topics: [
      { title: "Estrategia de conteudo baseada em dados", duration: "25min", xp: 75 },
      { title: "Criando artigos que rankeiam no Google", duration: "30min", xp: 75 },
      { title: "Social media: Instagram, TikTok, YouTube", duration: "30min", xp: 75 },
      { title: "Email marketing que converte", duration: "25min", xp: 50 },
      { title: "Calendario editorial eficiente", duration: "20min", xp: 50 },
      { title: "Reaproveitamento de conteudo (repurpose)", duration: "20min", xp: 75 },
    ],
  },
  {
    id: "conversion-optimization",
    title: "Otimizacao de Conversao (CRO)",
    description: "Aumente suas vendas sem gastar mais. Testes A/B, copywriting, UX.",
    modules: 5,
    duration: "2.5 horas",
    level: "avancado",
    xpReward: 350,
    badge: "CRO Expert",
    topics: [
      { title: "Fundamentos de CRO e metricas", duration: "20min", xp: 50 },
      { title: "Testes A/B: o que testar e como", duration: "30min", xp: 75 },
      { title: "Copywriting de alta conversao", duration: "30min", xp: 75 },
      { title: "Design de landing pages que convertem", duration: "30min", xp: 75 },
      { title: "Ferramentas e framework de CRO", duration: "20min", xp: 75 },
    ],
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get("courseId")
  const level = searchParams.get("level")

  if (courseId) {
    const course = COURSES.find((c) => c.id === courseId)
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
    return NextResponse.json(course)
  }

  let filtered = COURSES
  if (level) filtered = COURSES.filter((c) => c.level === level)

  return NextResponse.json({
    courses: filtered,
    total: filtered.length,
    totalXP: filtered.reduce((sum, c) => sum + c.xpReward, 0),
  })
}
