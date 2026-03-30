import { db } from "@/lib/db"

export interface RevenueForcast {
  month: string
  predicted: number
  optimistic: number
  pessimistic: number
}

export interface BudgetAllocation {
  channel: string
  currentSpend: number
  recommendedSpend: number
  expectedROAS: number
  reason: string
}

export interface HealthTrend {
  date: string
  score: number
}

/**
 * Predictive Revenue Forecasting
 * Uses historical data + growth rate to project next 6 months
 */
export async function forecastRevenue(userId: string): Promise<RevenueForcast[]> {
  // Get historical health scores as proxy for growth
  const scores = await db.healthScore.findMany({
    where: { userId },
    orderBy: { calculatedAt: "asc" },
    take: 12,
  })

  // Get ad campaign spend data
  const adAccounts = await db.adAccount.findMany({
    where: { userId, isActive: true },
    select: { id: true },
  })

  const snapshots = adAccounts.length > 0
    ? await db.adCampaignSnapshot.findMany({
        where: { adAccountId: { in: adAccounts.map((a) => a.id) } },
        orderBy: { snapshotAt: "desc" },
        take: 30,
      })
    : []

  const totalSpend = snapshots.reduce((sum, s) => sum + s.spend, 0)
  const totalConversions = snapshots.reduce((sum, s) => sum + s.conversions, 0)
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 50
  const avgROAS = totalSpend > 0 && totalConversions > 0 ? (totalConversions * 100) / totalSpend : 2.5

  // Calculate growth rate from health scores
  const recentScores = scores.slice(-6)
  let growthRate = 0.05 // default 5% monthly growth
  if (recentScores.length >= 2) {
    const first = recentScores[0].overallScore
    const last = recentScores[recentScores.length - 1].overallScore
    growthRate = first > 0 ? (last - first) / first / recentScores.length : 0.05
    growthRate = Math.max(0.01, Math.min(growthRate, 0.3)) // cap between 1-30%
  }

  // Base revenue estimation from current metrics
  const monthlyBaseRevenue = totalSpend > 0
    ? (totalSpend / Math.max(snapshots.length / 30, 1)) * avgROAS
    : 5000 // default estimate

  const forecasts: RevenueForcast[] = []
  const now = new Date()

  for (let i = 1; i <= 6; i++) {
    const futureDate = new Date(now)
    futureDate.setMonth(futureDate.getMonth() + i)
    const monthLabel = futureDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

    const multiplier = Math.pow(1 + growthRate, i)
    const predicted = Math.round(monthlyBaseRevenue * multiplier)

    forecasts.push({
      month: monthLabel,
      predicted,
      optimistic: Math.round(predicted * 1.25),
      pessimistic: Math.round(predicted * 0.75),
    })
  }

  return forecasts
}

/**
 * Budget Optimizer
 * Analyzes campaign performance and suggests reallocation
 */
export async function optimizeBudget(userId: string): Promise<BudgetAllocation[]> {
  const adAccounts = await db.adAccount.findMany({
    where: { userId, isActive: true },
    include: {
      campaigns: { orderBy: { snapshotAt: "desc" }, take: 10 },
    },
  })

  const allocations: BudgetAllocation[] = []

  for (const account of adAccounts) {
    const snaps = account.campaigns
    if (snaps.length === 0) continue

    const totalSpend = snaps.reduce((s, snap) => s + snap.spend, 0)
    const totalConv = snaps.reduce((s, snap) => s + snap.conversions, 0)
    const avgCPC = snaps.reduce((s, snap) => s + (snap.cpc || 0), 0) / snaps.length
    const roas = totalSpend > 0 && totalConv > 0 ? (totalConv * 100) / totalSpend : 0

    let recommendedMultiplier = 1
    let reason = "Manter investimento atual"

    if (roas > 3) {
      recommendedMultiplier = 1.3
      reason = "ROAS alto — aumentar investimento para escalar"
    } else if (roas > 2) {
      recommendedMultiplier = 1.1
      reason = "ROAS bom — leve aumento recomendado"
    } else if (roas < 1) {
      recommendedMultiplier = 0.5
      reason = "ROAS negativo — reduzir e otimizar criativos"
    } else if (roas < 1.5) {
      recommendedMultiplier = 0.8
      reason = "ROAS baixo — reduzir e testar novos publicos"
    }

    allocations.push({
      channel: account.platform,
      currentSpend: Math.round(totalSpend / Math.max(snaps.length / 30, 1)),
      recommendedSpend: Math.round((totalSpend / Math.max(snaps.length / 30, 1)) * recommendedMultiplier),
      expectedROAS: Math.round(roas * 10) / 10,
      reason,
    })
  }

  // Add organic recommendation if no ad accounts
  if (allocations.length === 0) {
    allocations.push({
      channel: "SEO_ORGANIC",
      currentSpend: 0,
      recommendedSpend: 0,
      expectedROAS: 0,
      reason: "Conecte suas contas de anuncio para receber recomendacoes de orcamento",
    })
  }

  return allocations
}

/**
 * Health Score Trend
 * Returns historical health scores for trend analysis
 */
export async function getHealthTrend(userId: string, days: number = 90): Promise<HealthTrend[]> {
  const scores = await db.healthScore.findMany({
    where: { userId },
    orderBy: { calculatedAt: "asc" },
    select: { overallScore: true, calculatedAt: true },
  })

  return scores.map((s) => ({
    date: s.calculatedAt.toISOString().split("T")[0],
    score: s.overallScore,
  }))
}

/**
 * Attribution Analysis
 * Maps conversions back to channels
 */
export async function getAttributionData(userId: string) {
  const adAccounts = await db.adAccount.findMany({
    where: { userId, isActive: true },
    include: {
      campaigns: { orderBy: { snapshotAt: "desc" }, take: 5 },
    },
  })

  const channels: { channel: string; conversions: number; spend: number; percentage: number }[] = []
  let totalConversions = 0

  for (const account of adAccounts) {
    const convs = account.campaigns.reduce((s, snap) => s + snap.conversions, 0)
    const spend = account.campaigns.reduce((s, snap) => s + snap.spend, 0)
    totalConversions += convs
    channels.push({
      channel: account.platform,
      conversions: convs,
      spend,
      percentage: 0,
    })
  }

  // Add organic estimate
  const organicEstimate = Math.floor(totalConversions * 0.3) || 5
  totalConversions += organicEstimate
  channels.push({
    channel: "ORGANIC",
    conversions: organicEstimate,
    spend: 0,
    percentage: 0,
  })

  // Calculate percentages
  for (const ch of channels) {
    ch.percentage = totalConversions > 0 ? Math.round((ch.conversions / totalConversions) * 100) : 0
  }

  return { channels, totalConversions }
}
