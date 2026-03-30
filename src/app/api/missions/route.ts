import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateWeeklyMissions, completeMission, updateStreak } from "@/lib/services/mission-engine"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  // Update streak on dashboard visit
  await updateStreak(userId)

  // Generate missions if needed
  await generateWeeklyMissions(userId)

  const missions = await db.userMission.findMany({
    where: { userId },
    include: { mission: true },
    orderBy: { assignedAt: "desc" },
    take: 10,
  })

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, levelTitle: true, streakDays: true },
  })

  return NextResponse.json({ missions, user })
}

export async function POST(req: Request) {
  try {
    const { userId, userMissionId, action } = await req.json()

    if (action === "complete") {
      const result = await completeMission(userId, userMissionId)
      return NextResponse.json(result)
    }

    if (action === "generate") {
      await generateWeeklyMissions(userId)
      return NextResponse.json({ message: "Missions generated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
