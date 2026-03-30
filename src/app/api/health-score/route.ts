import { NextResponse } from "next/server"
import { calculateHealthScore, saveHealthScore, getLatestHealthScore } from "@/lib/services/health-score"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const score = await getLatestHealthScore(userId)

  // Get score history (last 30 days)
  const history = await db.healthScore.findMany({
    where: { userId },
    orderBy: { calculatedAt: "desc" },
    take: 30,
    select: { overallScore: true, calculatedAt: true },
  })

  return NextResponse.json({ current: score, history })
}

export async function POST(req: Request) {
  try {
    const { userId, input } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    // If no input provided, calculate with defaults/basic checks
    const scoreInput = input || {
      hasMetaDescription: false,
      hasSitemap: false,
      hasRobotsTxt: false,
      hasSSL: true,
      mobileResponsive: true,
      pageSpeedScore: 65,
      totalArticles: 0,
      articlesLast30Days: 0,
      missionsCompletedLast7Days: 0,
      daysActive: 1,
      keywordsTracked: 0,
      keywordsInTop10: 0,
    }

    // Enrich with real data from DB
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [articleCount, recentArticles, completedMissions] = await Promise.all([
      db.content.count({ where: { userId, type: "ARTICLE" } }),
      db.content.count({ where: { userId, type: "ARTICLE", createdAt: { gte: startOfMonth } } }),
      db.userMission.count({ where: { userId, status: "COMPLETED", completedAt: { gte: weekAgo } } }),
    ])

    scoreInput.totalArticles = articleCount
    scoreInput.articlesLast30Days = recentArticles
    scoreInput.missionsCompletedLast7Days = completedMissions

    const result = calculateHealthScore(scoreInput)
    await saveHealthScore(userId, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Health score error:", error)
    return NextResponse.json({ error: "Erro ao calcular score" }, { status: 500 })
  }
}
