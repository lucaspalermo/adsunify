import { db } from "@/lib/db"

// Track an action and check if any missions should be completed
export async function trackAction(userId: string, action: string, metadata?: Record<string, unknown>) {
  // Get user's active missions
  const activeMissions = await db.userMission.findMany({
    where: { userId, status: "ACTIVE" },
    include: { mission: true },
  })

  const results: Array<{ missionId: string; missionTitle: string; xpAwarded: number; leveledUp: boolean; newLevel?: number; newTitle?: string }> = []

  for (const um of activeMissions) {
    const criteria = um.mission.criteria as { action?: string; count?: number } | null
    if (!criteria || criteria.action !== action) continue

    // Calculate new progress
    let currentCount = 0

    switch (action) {
      case "publish_article":
      case "generate_content": {
        currentCount = await db.content.count({ where: { userId } })
        break
      }
      case "add_keywords": {
        currentCount = await db.trackedKeyword.count({ where: { userId } })
        break
      }
      case "copilot_chat": {
        currentCount = await db.copilotMessage.count({
          where: { thread: { userId }, role: "user" },
        })
        break
      }
      case "read_glossary": {
        // Approximate by counting actions - for now count as done
        currentCount = (metadata?.count as number) || 1
        break
      }
      case "analyze_competitor": {
        currentCount = await db.competitor.count({ where: { userId } })
        break
      }
      case "daily_login": {
        const user = await db.user.findUnique({ where: { id: userId }, select: { streakDays: true } })
        currentCount = user?.streakDays || 0
        break
      }
      case "health_score_target": {
        const latest = await db.healthScore.findFirst({
          where: { userId },
          orderBy: { calculatedAt: "desc" },
        })
        currentCount = latest?.overallScore || 0
        break
      }
      default:
        currentCount = 1
    }

    const target = criteria.count || 1
    const progress = Math.min(1, currentCount / target)

    // Update mission progress
    await db.userMission.update({
      where: { id: um.id },
      data: { progress },
    })

    // If complete, award XP
    if (progress >= 1 && um.status === "ACTIVE") {
      await db.userMission.update({
        where: { id: um.id },
        data: { status: "COMPLETED", completedAt: new Date(), progress: 1 },
      })

      // Award XP
      const user = await db.user.update({
        where: { id: userId },
        data: { xp: { increment: um.mission.xpReward } },
      })

      // Check level up
      const levelThresholds = [
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
      ]

      const newLevel = levelThresholds.filter(l => user.xp >= l.xp).pop()
      let leveledUp = false
      let newLevelNum: number | undefined
      let newTitle: string | undefined

      if (newLevel && newLevel.level > user.level) {
        await db.user.update({
          where: { id: userId },
          data: { level: newLevel.level, levelTitle: newLevel.title },
        })
        leveledUp = true
        newLevelNum = newLevel.level
        newTitle = newLevel.title
      }

      results.push({
        missionId: um.id,
        missionTitle: um.mission.title,
        xpAwarded: um.mission.xpReward,
        leveledUp,
        newLevel: newLevelNum,
        newTitle,
      })

      // Create notification
      await db.notification.create({
        data: {
          userId,
          type: "mission_complete",
          title: `Missao completada: ${um.mission.title}`,
          body: `Voce ganhou ${um.mission.xpReward} XP!`,
          actionUrl: "/missoes",
        },
      })
    }
  }

  return results
}
