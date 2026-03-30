import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedGlossary() {
  const { GLOSSARY_TERMS } = await import("../src/lib/services/glossary-service")

  for (const term of GLOSSARY_TERMS) {
    await prisma.glossaryTerm.upsert({
      where: { slug: term.slug },
      update: {
        term: term.term,
        definition: term.definition,
        analogy: term.analogy,
        category: term.category,
        relatedTerms: term.relatedTerms,
      },
      create: {
        term: term.term,
        slug: term.slug,
        definition: term.definition,
        analogy: term.analogy,
        category: term.category,
        relatedTerms: term.relatedTerms,
      },
    })
  }

  console.log("Glossary seeded: " + GLOSSARY_TERMS.length + " terms")
}

async function seedJourneyMilestones() {
  const milestones = [
    { slug: "first-steps", order: 1, title: "Primeiros Passos", description: "Configure seu perfil e conecte seu site", xpRequired: 0, icon: "footprints", levelTitle: "Iniciante", requirements: { type: "onboarding" }, rewards: { badge: "first-steps" } },
    { slug: "seo-explorer", order: 2, title: "Explorador de SEO", description: "Adicione suas primeiras palavras-chave e entenda o basico de SEO", xpRequired: 200, icon: "compass", levelTitle: "Explorador", requirements: { type: "keywords", count: 5 }, rewards: { badge: "seo-explorer" } },
    { slug: "content-creator", order: 3, title: "Criador de Conteudo", description: "Publique seus primeiros artigos otimizados", xpRequired: 500, icon: "pen-tool", levelTitle: "Aprendiz", requirements: { type: "articles", count: 3 }, rewards: { badge: "content-creator" } },
    { slug: "data-analyst", order: 4, title: "Analista de Dados", description: "Domine as metricas e acompanhe seus resultados", xpRequired: 2000, icon: "bar-chart", levelTitle: "Estrategista", requirements: { type: "health_score", value: 70 }, rewards: { badge: "data-analyst" } },
    { slug: "digital-strategist", order: 5, title: "Estrategista Digital", description: "Combine SEO, conteudo e anuncios em uma estrategia completa", xpRequired: 5500, icon: "target", levelTitle: "Avancado", requirements: { type: "level", value: 7 }, rewards: { badge: "digital-strategist" } },
    { slug: "marketing-master", order: 6, title: "Mestre do Marketing", description: "Alcance o nivel maximo e domine todas as ferramentas", xpRequired: 18000, icon: "crown", levelTitle: "Lenda", requirements: { type: "level", value: 10 }, rewards: { badge: "marketing-master" } },
  ]

  for (const milestone of milestones) {
    await prisma.journeyMilestone.upsert({
      where: { slug: milestone.slug },
      update: milestone,
      create: milestone,
    })
  }

  console.log("Journey milestones seeded: " + milestones.length)
}

async function seedBadges() {
  const badges = [
    { slug: "first-steps", name: "Primeiros Passos", description: "Completou a configuracao inicial", icon: "footprints", rarity: "common", criteria: { type: "onboarding" } },
    { slug: "seo-explorer", name: "Explorador de SEO", description: "Dominou os conceitos basicos de SEO", icon: "compass", rarity: "common", criteria: { type: "level", value: 2 } },
    { slug: "content-creator", name: "Criador de Conteudo", description: "Publicou seus primeiros artigos", icon: "pen-tool", rarity: "common", criteria: { type: "articles", count: 3 } },
    { slug: "data-analyst", name: "Analista de Dados", description: "Dominou as metricas de marketing", icon: "bar-chart", rarity: "rare", criteria: { type: "level", value: 5 } },
    { slug: "digital-strategist", name: "Estrategista Digital", description: "Combinou todas as estrategias de marketing", icon: "target", rarity: "epic", criteria: { type: "level", value: 7 } },
    { slug: "marketing-master", name: "Mestre do Marketing", description: "Alcancou o nivel maximo de maestria", icon: "crown", rarity: "legendary", criteria: { type: "level", value: 10 } },
    { slug: "streak-7", name: "Sequencia de 7 Dias", description: "Acessou o dashboard por 7 dias seguidos", icon: "flame", rarity: "rare", criteria: { type: "streak", value: 7 } },
    { slug: "streak-30", name: "Sequencia de 30 Dias", description: "Acessou o dashboard por 30 dias seguidos", icon: "zap", rarity: "epic", criteria: { type: "streak", value: 30 } },
    { slug: "health-80", name: "Site Saudavel", description: "Alcancou Health Score de 80 ou mais", icon: "heart-pulse", rarity: "rare", criteria: { type: "health_score", value: 80 } },
    { slug: "first-article", name: "Primeiro Artigo", description: "Publicou seu primeiro artigo com a Fabrica de Conteudo", icon: "file-text", rarity: "common", criteria: { type: "articles", count: 1 } },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    })
  }

  console.log("Badges seeded: " + badges.length)
}

async function main() {
  console.log("Starting seed...")
  await seedGlossary()
  await seedJourneyMilestones()
  await seedBadges()
  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
