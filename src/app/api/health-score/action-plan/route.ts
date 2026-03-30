import { NextResponse } from "next/server"
import { getLatestHealthScore } from "@/lib/services/health-score"
import { generateActionPlan } from "@/lib/services/health-score"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const latestScore = await getLatestHealthScore(userId)
  if (!latestScore) {
    return NextResponse.json({ error: "No health score found. Run a diagnostic first." }, { status: 404 })
  }

  // Reconstruct result from DB data
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

  const actionPlan = generateActionPlan(result)

  return NextResponse.json({
    overallScore: latestScore.overallScore,
    actions: actionPlan,
    weeklyPlan: {
      week1: actionPlan.filter((a) => a.weekSuggestion === 1),
      week2: actionPlan.filter((a) => a.weekSuggestion === 2),
      week3: actionPlan.filter((a) => a.weekSuggestion === 3),
      week4: actionPlan.filter((a) => a.weekSuggestion === 4),
    },
    stats: {
      totalActions: actionPlan.length,
      quickWins: actionPlan.filter((a) => a.priority === "quick-win").length,
      bigProjects: actionPlan.filter((a) => a.priority === "big-project").length,
    },
  })
}
