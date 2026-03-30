import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { niche, product, budget, targetAudience, userId } = await req.json()

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const prompt = `Voce e um estrategista de funis de venda para o mercado brasileiro.

Crie um funil completo de vendas em 5 minutos para:

Nicho: ${niche || "geral"}
Produto/Servico: ${product || "nao especificado"}
Orcamento mensal: ${budget || "R$500-1000"}
Publico-alvo: ${targetAudience || "geral"}

Responda SOMENTE em JSON valido:
{
  "funnelName": "nome do funil",
  "stages": [
    {
      "stage": "TOFU|MOFU|BOFU",
      "name": "nome da etapa",
      "objective": "objetivo",
      "channels": ["instagram", "google_ads", "email", "whatsapp"],
      "content": "tipo de conteudo para essa etapa",
      "adCopy": "texto do anuncio se aplicavel",
      "landingPage": "descricao da landing page",
      "cta": "call to action",
      "metrics": ["metrica a acompanhar"],
      "budget": "percentual do orcamento"
    }
  ],
  "automations": [
    {
      "trigger": "gatilho",
      "action": "acao automatica",
      "channel": "canal"
    }
  ],
  "expectedResults": {
    "impressions": "range estimado",
    "clicks": "range",
    "leads": "range",
    "sales": "range",
    "roi": "estimativa"
  },
  "timeline": "cronograma de implementacao"
}`

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const funnel = JSON.parse(cleaned)

    return NextResponse.json(funnel)
  } catch (error) {
    console.error("Funnel generation error:", error)
    return NextResponse.json({ error: "Failed to generate funnel" }, { status: 500 })
  }
}
