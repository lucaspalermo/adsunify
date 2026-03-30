import { db } from "@/lib/db"

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Iniciante" },
  { level: 2, xp: 200, title: "Explorador" },
  { level: 3, xp: 500, title: "Aprendiz" },
  { level: 4, xp: 1000, title: "Praticante" },
  { level: 5, xp: 2000, title: "Estrategista" },
  { level: 6, xp: 3500, title: "Especialista" },
  { level: 7, xp: 5500, title: "Avancado" },
  { level: 8, xp: 8000, title: "Expert" },
  { level: 9, xp: 12000, title: "Mestre" },
  { level: 10, xp: 18000, title: "Lenda" },
] as const

export const MISSION_TEMPLATES = [
  { title: "Publique 1 artigo no blog", description: "Use a Fabrica de Conteudo para gerar um artigo otimizado para SEO", type: "CONTENT" as const, difficulty: "EASY" as const, xpReward: 50, criteria: { action: "publish_article", count: 1 } },
  { title: "Leia 3 termos no Glossario", description: "Amplie seu conhecimento de marketing digital", type: "LEARNING" as const, difficulty: "EASY" as const, xpReward: 30, criteria: { action: "read_glossary", count: 3 } },
  { title: "Acesse o dashboard por 3 dias seguidos", description: "Mantenha sua sequencia ativa", type: "LEARNING" as const, difficulty: "EASY" as const, xpReward: 40, criteria: { action: "daily_login", count: 3 } },
  { title: "Peca uma dica ao Co-Piloto IA", description: "Converse com o Co-Piloto sobre seu negocio", type: "LEARNING" as const, difficulty: "EASY" as const, xpReward: 30, criteria: { action: "copilot_chat", count: 1 } },
  { title: "Adicione 3 palavras-chave para rastrear", description: "Monitore suas posicoes no Google", type: "SEO" as const, difficulty: "MEDIUM" as const, xpReward: 100, criteria: { action: "add_keywords", count: 3 } },
  { title: "Gere 3 conteudos com IA", description: "Artigos, posts ou textos de anuncio", type: "CONTENT" as const, difficulty: "MEDIUM" as const, xpReward: 100, criteria: { action: "generate_content", count: 3 } },
  { title: "Analise 1 concorrente", description: "Adicione um concorrente e estude seus pontos fortes", type: "SEO" as const, difficulty: "MEDIUM" as const, xpReward: 80, criteria: { action: "analyze_competitor", count: 1 } },
  { title: "Melhore o Health Score em 5 pontos", description: "Siga as dicas do dashboard para melhorar", type: "SEO" as const, difficulty: "MEDIUM" as const, xpReward: 120, criteria: { action: "improve_health", count: 5 } },
  { title: "Publique 5 artigos esta semana", description: "Uma semana intensa de producao de conteudo", type: "CONTENT" as const, difficulty: "HARD" as const, xpReward: 200, criteria: { action: "publish_article", count: 5 } },
  { title: "Alcance Health Score 80+", description: "Otimize todos os aspectos do seu marketing", type: "SEO" as const, difficulty: "HARD" as const, xpReward: 250, criteria: { action: "health_score_target", count: 80 } },
  { title: "Adicione 10 palavras-chave para rastrear", description: "Construa uma base solida de monitoramento", type: "SEO" as const, difficulty: "HARD" as const, xpReward: 200, criteria: { action: "add_keywords", count: 10 } },
  { title: "Complete todas as missoes da semana", description: "Mostre que voce eh dedicado!", type: "LEARNING" as const, difficulty: "LEGENDARY" as const, xpReward: 500, criteria: { action: "complete_all_weekly", count: 1 } },
]

function getEndOfWeek(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSunday = 7 - dayOfWeek
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + daysUntilSunday)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function generateWeeklyMissions(userId: string) {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const existing = await db.userMission.findFirst({
    where: { userId, assignedAt: { gte: startOfWeek } },
  })

  if (existing) return

  const easy = shuffle(MISSION_TEMPLATES.filter((m) => m.difficulty === "EASY")).slice(0, 2)
  const medium = shuffle(MISSION_TEMPLATES.filter((m) => m.difficulty === "MEDIUM")).slice(0, 2)
  const hard = shuffle(MISSION_TEMPLATES.filter((m) => m.difficulty === "HARD")).slice(0, 1)
  const selected = [...easy, ...medium, ...hard]

  const expiresAt = getEndOfWeek()

  for (const template of selected) {
    const mission = await db.mission.create({
      data: {
        title: template.title,
        description: template.description,
        type: template.type,
        category: "WEEKLY",
        xpReward: template.xpReward,
        difficulty: template.difficulty,
        criteria: template.criteria,
        isTemplate: false,
      },
    })

    await db.userMission.create({
      data: { userId, missionId: mission.id, expiresAt },
    })
  }
}

export async function completeMission(userId: string, userMissionId: string) {
  const userMission = await db.userMission.findUnique({
    where: { id: userMissionId },
    include: { mission: true },
  })

  if (!userMission || userMission.userId !== userId) throw new Error("Missao nao encontrada")
  if (userMission.status !== "ACTIVE") throw new Error("Missao ja foi completada")

  await db.userMission.update({
    where: { id: userMissionId },
    data: { status: "COMPLETED", progress: 1, completedAt: new Date() },
  })

  const user = await db.user.update({
    where: { id: userId },
    data: { xp: { increment: userMission.mission.xpReward } },
  })

  const levelResult = await checkLevelUp(userId, user.xp)
  return { xpAwarded: userMission.mission.xpReward, ...levelResult }
}

export async function checkLevelUp(userId: string, currentXp: number) {
  const currentLevel = LEVEL_THRESHOLDS.filter((l) => currentXp >= l.xp).pop()
  if (!currentLevel) return { leveled: false }

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user || user.level >= currentLevel.level) return { leveled: false }

  await db.user.update({
    where: { id: userId },
    data: { level: currentLevel.level, levelTitle: currentLevel.title },
  })

  return { leveled: true, newLevel: currentLevel.level, newTitle: currentLevel.title }
}

export async function updateStreak(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak = 1
  if (user.streakLastDate) {
    const lastDate = new Date(user.streakLastDate)
    lastDate.setHours(0, 0, 0, 0)

    if (lastDate.getTime() === today.getTime()) return user.streakDays
    if (lastDate.getTime() === yesterday.getTime()) newStreak = user.streakDays + 1
  }

  await db.user.update({
    where: { id: userId },
    data: { streakDays: newStreak, streakLastDate: new Date() },
  })

  return newStreak
}
