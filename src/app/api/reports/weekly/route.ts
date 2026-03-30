import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail, buildWeeklyReportEmail } from "@/lib/email"
import { generateActionPlan, getLatestHealthScore } from "@/lib/services/health-score"

// POST: Generate and send weekly report for a user
export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user?.email) return NextResponse.json({ error: "User not found or no email" }, { status: 404 })

    // Get current and previous health scores
    const scores = await db.healthScore.findMany({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
      take: 2,
    })

    const currentScore = scores[0]?.overallScore || 0
    const previousScore = scores[1]?.overallScore || currentScore
    const scoreChange = currentScore - previousScore

    // Get missions completed this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const missionsCompleted = await db.userMission.count({
      where: { userId, status: "COMPLETED", completedAt: { gte: weekAgo } },
    })

    // Get content published this week
    const contentPublished = await db.content.count({
      where: { userId, createdAt: { gte: weekAgo } },
    })

    // Get top keywords with latest ranking
    const keywords = await db.trackedKeyword.findMany({
      where: { userId },
      include: { rankings: { orderBy: { checkedAt: "desc" }, take: 2 } },
      take: 5,
    })

    const topKeywords = keywords.map((kw) => {
      const latest = kw.rankings[0]
      const prev = kw.rankings[1]
      return {
        keyword: kw.keyword,
        position: latest?.position || 0,
        change: prev?.position && latest?.position ? (prev.position - latest.position) : 0,
      }
    })

    // Generate opportunities from action plan
    const latestScore = await getLatestHealthScore(userId)
    let opportunities: string[] = []
    if (latestScore) {
      const breakdown = (latestScore.breakdown as Record<string, { score: number; maxScore: number; label: string; tip: string }>) || {}
      const result = {
        overallScore: latestScore.overallScore,
        seoScore: latestScore.seoScore ?? 0,
        contentScore: latestScore.contentScore ?? 0,
        speedScore: latestScore.speedScore ?? 0,
        activityScore: 0,
        socialScore: latestScore.socialScore ?? 0,
        breakdown,
      }
      const actions = generateActionPlan(result)
      opportunities = actions.filter((a) => a.priority === "quick-win").slice(0, 3).map((a) => a.title)
    }

    // Build and send email
    const html = buildWeeklyReportEmail({
      userName: user.name || "Usuario",
      overallScore: currentScore,
      scoreChange,
      topKeywords,
      missionsCompleted,
      contentPublished,
      opportunities,
    })

    const emailResult = await sendEmail({
      to: user.email,
      subject: `📊 Seu relatorio semanal — Score ${currentScore}/100`,
      html,
    })

    // Save report record
    const now = new Date()
    const weekNum = Math.ceil(now.getDate() / 7)
    await db.report.create({
      data: {
        userId,
        type: "WEEKLY_SUMMARY",
        title: `Relatorio Semanal — ${now.toLocaleDateString("pt-BR")}`,
        period: `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`,
        data: JSON.parse(JSON.stringify({
          overallScore: currentScore,
          scoreChange,
          missionsCompleted,
          contentPublished,
          topKeywords,
          opportunities,
        })),
      },
    })

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      report: {
        score: currentScore,
        change: scoreChange,
        missions: missionsCompleted,
        content: contentPublished,
      },
    })
  } catch (error) {
    console.error("Weekly report error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

// GET: Retrieve past reports
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const reports = await db.report.findMany({
    where: { userId, type: "WEEKLY_SUMMARY" },
    orderBy: { createdAt: "desc" },
    take: 12,
  })

  return NextResponse.json(reports)
}
