import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 12)

  await prisma.user.upsert({
    where: { email: "demo@adsunify.com" },
    update: {},
    create: {
      name: "Usuario Demo",
      email: "demo@adsunify.com",
      passwordHash,
      xp: 0,
      level: 1,
      levelTitle: "Iniciante",
      streakDays: 0,
      plan: "AGENCIA",
    },
  })

  // Glossary terms
  const terms = [
    { term: "SEO", slug: "seo", definition: "Otimizacao para mecanismos de busca. Tecnicas para seu site aparecer no Google.", analogy: "E como arrumar a vitrine da loja para atrair clientes", category: "SEO" },
    { term: "Palavra-chave", slug: "palavra-chave", definition: "O termo que as pessoas digitam no Google para encontrar algo.", analogy: "E como a placa da sua loja", category: "SEO" },
    { term: "CPC", slug: "cpc", definition: "Custo Por Clique. Quanto voce paga cada vez que alguem clica no anuncio.", analogy: "E como pagar pedagio por cada visitante", category: "Anuncios" },
    { term: "CTR", slug: "ctr", definition: "Taxa de Cliques. De cada 100 que viram, quantas clicaram.", analogy: "Quantos param pra olhar sua vitrine e entram", category: "Analytics" },
    { term: "Trafego Organico", slug: "trafego-organico", definition: "Visitantes que vem do Google sem pagar anuncios.", analogy: "Clientes que encontram sua loja sozinhos", category: "SEO" },
    { term: "Trafego Pago", slug: "trafego-pago", definition: "Visitantes que vem de anuncios pagos.", analogy: "Contratar panfleteiro para trazer gente", category: "Anuncios" },
    { term: "Landing Page", slug: "landing-page", definition: "Pagina especial para receber visitantes de anuncios.", analogy: "Porta de entrada decorada para novos clientes", category: "Geral" },
    { term: "Conversao", slug: "conversao", definition: "Quando o visitante faz o que voce quer: comprar, cadastrar.", analogy: "Quando o cliente realmente compra algo", category: "Analytics" },
    { term: "ROI", slug: "roi", definition: "Retorno Sobre Investimento. Quanto voltou de lucro.", analogy: "Se o panfleto trouxe mais lucro do que custou", category: "Analytics" },
    { term: "Meta Description", slug: "meta-description", definition: "Texto curto abaixo do titulo no Google.", analogy: "Resumo na contracapa do livro", category: "SEO" },
    { term: "Backlink", slug: "backlink", definition: "Link de outro site apontando pro seu.", analogy: "Recomendacao de alguem confiavel", category: "SEO" },
    { term: "Remarketing", slug: "remarketing", definition: "Mostrar anuncios pra quem ja visitou seu site.", analogy: "Produto que te segue depois que voce olhou", category: "Anuncios" },
    { term: "Funil de Vendas", slug: "funil-de-vendas", definition: "Caminho do cliente desde conhecer voce ate comprar.", analogy: "Muitos entram na loja, poucos compram", category: "Geral" },
    { term: "Engajamento", slug: "engajamento", definition: "Curtidas, comentarios, compartilhamentos.", analogy: "Quantos param pra conversar com voce", category: "Social Media" },
    { term: "CPA", slug: "cpa", definition: "Custo Por Aquisicao. Quanto custa cada cliente novo.", analogy: "Dividir gasto total pelo numero de clientes", category: "Anuncios" },
    { term: "Pixel", slug: "pixel", definition: "Codigo no site que rastreia visitantes.", analogy: "Camera digital que mostra de onde vieram", category: "Anuncios" },
    { term: "ROAS", slug: "roas", definition: "Retorno sobre gasto em anuncios.", analogy: "Cada real investido, quanto voltou", category: "Anuncios" },
    { term: "Teste A/B", slug: "teste-ab", definition: "Comparar duas versoes para ver qual funciona melhor.", analogy: "Duas vitrines, qual atrai mais", category: "Geral" },
    { term: "Impressoes", slug: "impressoes", definition: "Quantas vezes seu anuncio apareceu.", analogy: "Quantas vezes o outdoor foi visto", category: "Analytics" },
    { term: "Alcance", slug: "alcance", definition: "Quantas pessoas diferentes viram seu conteudo.", analogy: "Quantas casas receberam o panfleto", category: "Social Media" },
  ]
  for (const t of terms) {
    await prisma.glossaryTerm.upsert({
      where: { slug: t.slug },
      update: { term: t.term, definition: t.definition, analogy: t.analogy, category: t.category },
      create: { ...t, relatedTerms: undefined },
    })
  }

  // Badges
  const badges = [
    { slug: "first-steps", name: "Primeiros Passos", description: "Completou o setup", icon: "footprints", rarity: "common" },
    { slug: "first-article", name: "Primeiro Artigo", description: "Criou primeiro conteudo", icon: "file-text", rarity: "common" },
    { slug: "curious", name: "Curioso", description: "Leu 10 termos", icon: "book-open", rarity: "common" },
    { slug: "first-mission", name: "Missao Cumprida", description: "Completou primeira missao", icon: "target", rarity: "common" },
    { slug: "streak-7", name: "Dedicado", description: "7 dias seguidos", icon: "flame", rarity: "rare" },
    { slug: "top-10", name: "Top 10", description: "Palavra no top 10", icon: "trophy", rarity: "rare" },
    { slug: "content-10", name: "Produtor", description: "10 conteudos criados", icon: "pen-tool", rarity: "rare" },
    { slug: "strategist", name: "Estrategista", description: "Nivel 5", icon: "brain", rarity: "epic" },
    { slug: "health-90", name: "Site Perfeito", description: "Score 90+", icon: "heart-pulse", rarity: "epic" },
    { slug: "legend", name: "Lenda", description: "Nivel 10", icon: "crown", rarity: "legendary" },
  ]
  for (const b of badges) {
    await prisma.badge.upsert({ where: { slug: b.slug }, update: b, create: { ...b, criteria: undefined } })
  }

  // Milestones
  const milestones = [
    { slug: "first-steps", order: 1, title: "Primeiros Passos", description: "Configure seu perfil", xpRequired: 0, icon: "footprints", levelTitle: "Iniciante" },
    { slug: "explorer", order: 2, title: "Explorador", description: "Aprenda SEO basico", xpRequired: 200, icon: "compass", levelTitle: "Explorador" },
    { slug: "creator", order: 3, title: "Criador", description: "Publique conteudos", xpRequired: 500, icon: "pen-tool", levelTitle: "Aprendiz" },
    { slug: "strategist", order: 4, title: "Estrategista", description: "Domine metricas", xpRequired: 2000, icon: "bar-chart", levelTitle: "Estrategista" },
    { slug: "advanced", order: 5, title: "Avancado", description: "Combine estrategias", xpRequired: 5500, icon: "target", levelTitle: "Avancado" },
    { slug: "master", order: 6, title: "Mestre", description: "Domine tudo", xpRequired: 18000, icon: "crown", levelTitle: "Lenda" },
  ]
  for (const m of milestones) {
    await prisma.journeyMilestone.upsert({ where: { slug: m.slug }, update: m, create: { ...m, requirements: undefined, rewards: undefined } })
  }

  console.log("=== DEMO LIMPO (AGENCIA) ===")
  console.log("Email: demo@adsunify.com")
  console.log("Senha: demo123")
  console.log("Plano: AGENCIA")
  console.log("Dados de marketing: NENHUM")
  console.log("============================")
}

main().catch(console.error).finally(() => prisma.$disconnect())
