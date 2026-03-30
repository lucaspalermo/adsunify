import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { anthropic } from "@/lib/ai"

async function resolveUserId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user) return user.id
  const fallback = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  return fallback?.id || null
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    const realId = await resolveUserId(userId || "demo")
    if (!realId) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Get all campaign snapshots
    const accounts = await db.adAccount.findMany({
      where: { userId: realId, isActive: true },
      include: { campaigns: { orderBy: { snapshotAt: "desc" }, take: 20 } },
    })

    if (accounts.length === 0 || accounts.every(a => a.campaigns.length === 0)) {
      return NextResponse.json({ error: "Nenhuma campanha encontrada. Sincronize seus anuncios primeiro." }, { status: 400 })
    }

    // Build campaign data for AI
    const campaignData = accounts.flatMap(a =>
      a.campaigns.map(c => ({
        platform: a.platform,
        name: c.campaignName,
        status: c.status,
        spend: c.spend,
        clicks: c.clicks,
        impressions: c.impressions,
        conversions: c.conversions,
        cpc: c.cpc,
        ctr: c.ctr,
        roas: c.roas,
      }))
    )

    const user = await db.user.findUnique({ where: { id: realId }, select: { businessUrl: true, businessNiche: true } })

    // Ask AI to analyze
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: "Voce eh um gestor de trafego senior. Analise os dados das campanhas e de recomendacoes PRATICAS e ESPECIFICAS. Responda em JSON.",
      messages: [{
        role: "user",
        content: `Analise estas campanhas de anuncios e me diga o que esta certo, o que esta errado, e o que fazer para melhorar:

Site: ${user?.businessUrl || "N/A"}
Nicho: ${user?.businessNiche || "N/A"}

Campanhas:
${JSON.stringify(campaignData, null, 2)}

Responda em JSON:
{
  "overallScore": 0-100,
  "summary": "resumo geral do desempenho",
  "goodPoints": ["o que esta funcionando bem"],
  "problems": [{"issue": "problema", "severity": "alto|medio|baixo", "howToFix": "como resolver passo a passo"}],
  "optimizations": [{"action": "o que fazer", "expectedImpact": "resultado esperado", "priority": "urgente|importante|nice-to-have", "howTo": "passo a passo"}],
  "budgetRecommendation": "sugestao de orcamento",
  "pauseRecommendation": ["campanhas que devem ser pausadas e por que"],
  "increaseRecommendation": ["campanhas que merecem mais orcamento e por que"]
}`
      }],
    })

    const aiText = response.content[0].type === "text" ? response.content[0].text : ""
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null

    return NextResponse.json({ campaigns: campaignData, analysis })
  } catch (error) {
    console.error("Analyze error:", error)
    return NextResponse.json({ error: "Erro ao analisar" }, { status: 500 })
  }
}
