import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { niche, goals, keywords, month, userId } = await req.json()

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const now = new Date()
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}`

    const prompt = `Voce e um estrategista de conteudo digital para o mercado brasileiro.

Crie um calendario editorial completo para o mes ${targetMonth}.

Nicho: ${niche || "marketing digital"}
Objetivos: ${goals || "aumentar trafego e engajamento"}
Palavras-chave foco: ${keywords || "nenhuma especificada"}

Considere:
- Datas comemorativas brasileiras do mes
- Sazonalidade do nicho
- Mix de formatos (blog, social, video, email)
- Frequencia ideal de publicacao

Responda SOMENTE em JSON valido:
{
  "month": "${targetMonth}",
  "theme": "tema principal do mes",
  "weeks": [
    {
      "week": 1,
      "theme": "subtema da semana",
      "posts": [
        {
          "day": "segunda",
          "channel": "instagram|blog|youtube|tiktok|email|whatsapp",
          "type": "carrossel|reel|artigo|video|email|mensagem",
          "title": "titulo do conteudo",
          "description": "breve descricao",
          "targetKeyword": "keyword se aplicavel",
          "hook": "frase de abertura chamativa"
        }
      ]
    }
  ],
  "seasonalDates": ["data comemorativa relevante"],
  "monthlyGoals": ["meta 1", "meta 2"],
  "contentMix": {"blog": 4, "instagram": 12, "tiktok": 8, "youtube": 2, "email": 4, "whatsapp": 2}
}`

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const calendar = JSON.parse(cleaned)

    return NextResponse.json(calendar)
  } catch (error) {
    console.error("Calendar generation error:", error)
    return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 })
  }
}
