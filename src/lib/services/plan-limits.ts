import { db } from "@/lib/db"
import { getPlanLimits } from "@/lib/stripe"

export async function checkContentLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } })
  if (!user) return { allowed: false, used: 0, limit: 0 }

  const limits = getPlanLimits(user.plan)
  if (limits.contentsPerMonth === -1) return { allowed: true, used: 0, limit: -1 }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const used = await db.content.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  })

  return { allowed: used < limits.contentsPerMonth, used, limit: limits.contentsPerMonth }
}

export async function checkCompetitorLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } })
  if (!user) return { allowed: false, used: 0, limit: 0 }

  const limits = getPlanLimits(user.plan)
  if (limits.competitors === -1) return { allowed: true, used: 0, limit: -1 }

  const used = await db.competitor.count({ where: { userId } })
  return { allowed: used < limits.competitors, used, limit: limits.competitors }
}

export async function checkFunnelLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } })
  if (!user) return { allowed: false, used: 0, limit: 0 }

  const limits = getPlanLimits(user.plan)
  if (limits.funnelPages === -1) return { allowed: true, used: 0, limit: -1 }
  if (limits.funnelPages === 0) return { allowed: false, used: 0, limit: 0 }

  const used = await db.funnel.count({ where: { userId } })
  return { allowed: used < limits.funnelPages, used, limit: limits.funnelPages }
}

export async function getUserPlanInfo(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true, stripeSubId: true, stripeCustomerId: true },
  })
  if (!user) return null

  const limits = getPlanLimits(user.plan)
  const contentUsage = await checkContentLimit(userId)
  const competitorUsage = await checkCompetitorLimit(userId)

  return {
    plan: user.plan,
    expiresAt: user.planExpiresAt,
    hasStripe: !!user.stripeSubId,
    limits,
    usage: {
      contents: contentUsage,
      competitors: competitorUsage,
    },
  }
}
