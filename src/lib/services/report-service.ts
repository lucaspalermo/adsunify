import { db } from "@/lib/db"

interface ReportData {
  period: string
  healthScore: { current: number; previous: number; change: number }
  seo: { totalKeywords: number; inTop10: number; avgPosition: number }
  content: { articlesPublished: number; totalContent: number }
  missions: { completed: number; total: number; xpEarned: number }
  ads: { totalSpend: number; totalClicks: number; totalConversions: number; avgCpa: number }
  highlights: string[]
  recommendations: string[]
}

export async function generateMonthlyReport(userId: string, period?: string) {
  const now = new Date()
  const reportPeriod = period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [year, month] = reportPeriod.split("-").map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Gather data
  const [healthScores, keywords, contentCount, missions, user] = await Promise.all([
    db.healthScore.findMany({
      where: { userId, calculatedAt: { gte: startDate, lte: endDate } },
      orderBy: { calculatedAt: "desc" },
      take: 2,
    }),
    db.trackedKeyword.findMany({
      where: { userId },
      include: { rankings: { orderBy: { checkedAt: "desc" }, take: 1 } },
    }),
    db.content.count({ where: { userId, createdAt: { gte: startDate, lte: endDate } } }),
    db.userMission.findMany({
      where: { userId, assignedAt: { gte: startDate, lte: endDate } },
      include: { mission: { select: { xpReward: true } } },
    }),
    db.user.findUnique({ where: { id: userId }, select: { xp: true, level: true, levelTitle: true, businessName: true } }),
  ])

  const currentScore = healthScores[0]?.overallScore || 0
  const previousScore = healthScores[1]?.overallScore || 0
  const inTop10 = keywords.filter(k => k.rankings[0]?.position && k.rankings[0].position <= 10).length
  const avgPosition = keywords.length > 0
    ? keywords.reduce((s, k) => s + (k.rankings[0]?.position || 100), 0) / keywords.length
    : 0
  const completedMissions = missions.filter(m => m.status === "COMPLETED")
  const xpEarned = completedMissions.reduce((s, m) => s + (m.mission.xpReward || 0), 0)

  const highlights: string[] = []
  const recommendations: string[] = []

  if (currentScore > previousScore) highlights.push(`Health Score melhorou de ${previousScore} para ${currentScore}`)
  if (inTop10 > 0) highlights.push(`${inTop10} palavras-chave no Top 10 do Google`)
  if (contentCount > 0) highlights.push(`${contentCount} conteudos criados este mes`)
  if (completedMissions.length > 0) highlights.push(`${completedMissions.length} missoes completadas (+${xpEarned} XP)`)

  if (currentScore < 60) recommendations.push("Foque em melhorar o Health Score — siga as dicas do dashboard")
  if (contentCount < 4) recommendations.push("Publique pelo menos 4 artigos por mes para melhorar o SEO")
  if (keywords.length < 10) recommendations.push("Adicione mais palavras-chave para monitorar sua presenca no Google")
  if (completedMissions.length < 3) recommendations.push("Complete mais missoes semanais para ganhar XP e subir de nivel")

  const reportData: ReportData = {
    period: reportPeriod,
    healthScore: { current: currentScore, previous: previousScore, change: currentScore - previousScore },
    seo: { totalKeywords: keywords.length, inTop10, avgPosition: Math.round(avgPosition) },
    content: { articlesPublished: contentCount, totalContent: await db.content.count({ where: { userId } }) },
    missions: { completed: completedMissions.length, total: missions.length, xpEarned },
    ads: { totalSpend: 0, totalClicks: 0, totalConversions: 0, avgCpa: 0 },
    highlights,
    recommendations,
  }

  // Save report
  const report = await db.report.create({
    data: {
      userId,
      title: `Relatorio Mensal — ${getMonthName(month)} ${year}`,
      period: reportPeriod,
      type: "monthly",
      data: JSON.parse(JSON.stringify(reportData)),
    },
  })

  return { report, data: reportData }
}

export async function getUserReports(userId: string) {
  return db.report.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
  })
}

export async function getReportById(userId: string, reportId: string) {
  return db.report.findFirst({ where: { id: reportId, userId } })
}

function getMonthName(month: number): string {
  const months = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  return months[month - 1] || ""
}
