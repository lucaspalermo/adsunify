import { db } from "@/lib/db"

interface OptimizationSuggestion {
  id: string
  type: "pause" | "increase" | "decrease" | "schedule" | "audience"
  severity: "high" | "medium" | "low"
  campaignName: string
  campaignId: string
  title: string
  description: string
  impact: string
  action: string
}

export async function generateOptimizations(userId: string): Promise<OptimizationSuggestion[]> {
  const accounts = await db.adAccount.findMany({
    where: { userId, isActive: true },
    select: { id: true },
  })

  if (accounts.length === 0) return []

  const accountIds = accounts.map(a => a.id)
  const snapshots = await db.adCampaignSnapshot.findMany({
    where: { adAccountId: { in: accountIds } },
    orderBy: { snapshotAt: "desc" },
  })

  // Deduplicate to get latest per campaign
  const seen = new Set<string>()
  const campaigns = snapshots.filter(s => {
    const key = `${s.adAccountId}-${s.campaignId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const suggestions: OptimizationSuggestion[] = []
  let idCounter = 0

  for (const campaign of campaigns) {
    if (campaign.status !== "ACTIVE") continue

    // Rule: High CPA (3x average)
    const avgCpa = campaigns.reduce((s, c) => s + (c.cpa || 0), 0) / campaigns.length
    if (campaign.cpa && campaign.cpa > avgCpa * 2.5) {
      suggestions.push({
        id: `opt-${++idCounter}`,
        type: "pause",
        severity: "high",
        campaignName: campaign.campaignName,
        campaignId: campaign.campaignId,
        title: `Pause "${campaign.campaignName}"`,
        description: `CPA de R$${campaign.cpa.toFixed(2)} esta ${(campaign.cpa / avgCpa).toFixed(1)}x acima da media. Esta campanha esta gastando muito por conversao.`,
        impact: `Economia estimada: R$${(campaign.spend * 0.7).toFixed(2)}/mes`,
        action: "Pausar campanha",
      })
    }

    // Rule: High ROAS campaign - increase budget
    if (campaign.roas && campaign.roas > 3) {
      suggestions.push({
        id: `opt-${++idCounter}`,
        type: "increase",
        severity: "high",
        campaignName: campaign.campaignName,
        campaignId: campaign.campaignId,
        title: `Aumente orcamento de "${campaign.campaignName}"`,
        description: `ROAS de ${campaign.roas.toFixed(1)}x — cada R$1 investido retorna R$${campaign.roas.toFixed(2)}. Aumente o orcamento para maximizar lucro.`,
        impact: `Potencial de +${Math.round(campaign.conversions * 0.5)} conversoes/mes`,
        action: "Aumentar 30%",
      })
    }

    // Rule: Low CTR
    if (campaign.ctr && campaign.ctr < 1.5) {
      suggestions.push({
        id: `opt-${++idCounter}`,
        type: "audience",
        severity: "medium",
        campaignName: campaign.campaignName,
        campaignId: campaign.campaignId,
        title: `Revise o publico de "${campaign.campaignName}"`,
        description: `CTR de ${campaign.ctr.toFixed(2)}% esta abaixo do ideal (2%+). O anuncio pode nao estar atingindo o publico certo.`,
        impact: "Melhoria estimada de 50-100% no CTR",
        action: "Revisar segmentacao",
      })
    }

    // Rule: Schedule optimization
    if (campaign.clicks > 500 && campaign.conversions > 0) {
      suggestions.push({
        id: `opt-${++idCounter}`,
        type: "schedule",
        severity: "low",
        campaignName: campaign.campaignName,
        campaignId: campaign.campaignId,
        title: `Otimize horarios de "${campaign.campaignName}"`,
        description: "Baseado no padrao de conversoes, recomendamos concentrar o orcamento entre 18h-22h quando seu publico esta mais ativo.",
        impact: "Reducao estimada de 15-20% no CPA",
        action: "Ajustar horarios",
      })
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return suggestions
}

// Simulate budget prediction
export async function predictBudget(input: {
  monthlyBudget: number
  niche: string
  platform: string
}) {
  // Industry benchmarks (simplified)
  const benchmarks: Record<string, { cpc: number; convRate: number; cpl: number }> = {
    "E-commerce": { cpc: 0.85, convRate: 2.8, cpl: 30 },
    "Saude e Bem-estar": { cpc: 1.20, convRate: 3.2, cpl: 37 },
    "Educacao": { cpc: 0.95, convRate: 4.5, cpl: 21 },
    "Alimentacao": { cpc: 0.65, convRate: 3.8, cpl: 17 },
    "Servicos Profissionais": { cpc: 1.50, convRate: 2.5, cpl: 60 },
    "Imobiliario": { cpc: 2.10, convRate: 1.8, cpl: 116 },
    "Beleza e Estetica": { cpc: 0.75, convRate: 3.5, cpl: 21 },
    "Tecnologia": { cpc: 1.35, convRate: 2.2, cpl: 61 },
    "Moda": { cpc: 0.55, convRate: 3.0, cpl: 18 },
    "Fitness": { cpc: 0.80, convRate: 3.8, cpl: 21 },
    "Marketing": { cpc: 1.80, convRate: 2.0, cpl: 90 },
  }

  const benchmark = benchmarks[input.niche] || { cpc: 1.00, convRate: 3.0, cpl: 33 }

  // Adjust for platform
  const platformMultiplier = input.platform === "META_ADS" ? 0.85 : input.platform === "GOOGLE_ADS" ? 1.15 : 1.0

  const adjustedCpc = benchmark.cpc * platformMultiplier
  const estimatedClicks = Math.round(input.monthlyBudget / adjustedCpc)
  const estimatedLeads = Math.round(estimatedClicks * (benchmark.convRate / 100))
  const estimatedCpl = estimatedLeads > 0 ? input.monthlyBudget / estimatedLeads : 0

  // 6-month projection with growth
  const projection = Array.from({ length: 6 }, (_, i) => {
    const month = i + 1
    const growthFactor = 1 + (i * 0.08) // 8% improvement per month from optimization
    return {
      month,
      clicks: Math.round(estimatedClicks * growthFactor),
      leads: Math.round(estimatedLeads * growthFactor),
      spend: input.monthlyBudget,
      cpl: Math.round((input.monthlyBudget / (estimatedLeads * growthFactor)) * 100) / 100,
    }
  })

  return {
    estimated: {
      clicksMin: Math.round(estimatedClicks * 0.8),
      clicksMax: Math.round(estimatedClicks * 1.2),
      leadsMin: Math.round(estimatedLeads * 0.7),
      leadsMax: Math.round(estimatedLeads * 1.3),
      cplMin: Math.round(estimatedCpl * 0.75 * 100) / 100,
      cplMax: Math.round(estimatedCpl * 1.25 * 100) / 100,
    },
    benchmark: { ...benchmark, adjustedCpc: Math.round(adjustedCpc * 100) / 100 },
    projection,
  }
}
