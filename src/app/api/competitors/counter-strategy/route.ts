import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"

const anthropic = new Anthropic()

export async function POST(req: Request) {
  try {
    const { userId, competitorId } = await req.json()
    if (!userId || !competitorId) {
      return NextResponse.json({ error: "userId and competitorId required" }, { status: 400 })
    }

    const competitor = await db.competitor.findFirst({
      where: { id: competitorId, userId },
      include: { snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 } },
    })

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    const healthScore = await db.healthScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
    })

    const snapshot = competitor.snapshots[0]

    const prompt = `Voce e um estrategista de marketing digital. Analise a situacao abaixo e gere uma contra-estrategia detalhada.

MEUS DADOS:
- Nicho: ${user?.businessNiche || "nao informado"}
- Site: ${user?.businessUrl || "nao informado"}
- Score SEO: ${healthScore?.seoScore || 0}/100
- Score Conteudo: ${healthScore?.contentScore || 0}/100

CONCORRENTE:
- Nome: ${competitor.name}
- Dominio: ${competitor.domain}
- Autoridade: ${snapshot?.domainAuth || 0}
- Backlinks: ${snapshot?.backlinks || 0}
- Keywords organicas: ${snapshot?.organicKw || 0}
- Trafego estimado: ${snapshot?.traffic || 0}

Responda SOMENTE em JSON valido com esta estrutura:
{
  "summary": "resumo de 2 frases da estrategia geral",
  "shortTermActions": [{"action": "string", "timeline": "string", "expectedImpact": "alto|medio|baixo"}],
  "longTermActions": [{"action": "string", "timeline": "string", "expectedImpact": "alto|medio|baixo"}],
  "contentIdeas": [{"title": "string", "type": "blog|video|social|email", "targetKeyword": "string"}],
  "keywordOpportunities": ["string"],
  "budgetSuggestion": "string",
  "competitiveAdvantages": ["string que voce pode explorar"]
}`

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const strategy = JSON.parse(cleaned)

    return NextResponse.json({ strategy })
  } catch (error: any) {
    console.error("Counter-strategy error:", error)
    return NextResponse.json({ error: "Failed to generate strategy" }, { status: 500 })
  }
}
