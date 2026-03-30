import { NextResponse } from "next/server"
import { anthropic } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { product, targetAudience, platform, tone, keywords } = await req.json()

    if (!product) {
      return NextResponse.json({ error: "product description required" }, { status: 400 })
    }

    const platformInstructions: Record<string, string> = {
      GOOGLE_ADS: `Crie 3 variacoes de anuncio para Google Ads:
Para cada variacao:
- Titulo 1 (max 30 caracteres)
- Titulo 2 (max 30 caracteres)
- Titulo 3 (max 30 caracteres)
- Descricao 1 (max 90 caracteres)
- Descricao 2 (max 90 caracteres)
- URL de exibicao sugerida`,
      META_ADS: `Crie 3 variacoes de anuncio para Facebook/Instagram Ads:
Para cada variacao:
- Texto principal (max 125 caracteres para nao ser cortado)
- Titulo (max 40 caracteres)
- Descricao (max 30 caracteres)
- Call-to-action sugerido (ex: Saiba Mais, Compre Agora, Cadastre-se)`,
      BOTH: `Crie 2 variacoes para Google Ads E 2 para Meta Ads (Facebook/Instagram):

GOOGLE ADS (para cada):
- Titulo 1, 2, 3 (max 30 chars cada)
- Descricao 1, 2 (max 90 chars cada)

META ADS (para cada):
- Texto principal (max 125 chars)
- Titulo (max 40 chars)
- Call-to-action`,
    }

    const prompt = `${platformInstructions[platform] || platformInstructions.BOTH}

Produto/Servico: ${product}
Publico-alvo: ${targetAudience || "Nao especificado"}
Tom: ${tone || "Profissional e persuasivo"}
Palavras-chave para incluir: ${keywords || "Nao especificado"}

Requisitos:
- Textos persuasivos e diretos
- Inclua numeros ou dados quando possivel
- Use gatilhos mentais (urgencia, exclusividade, prova social)
- Cada variacao deve ter uma abordagem diferente
- Todos os textos em portugues brasileiro`

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: "Voce eh um copywriter especialista em anuncios digitais brasileiros. Crie textos persuasivos, curtos e diretos. Sempre respeite os limites de caracteres de cada plataforma.",
      messages: [{ role: "user", content: prompt }],
    })

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    })
  } catch (error) {
    console.error("Ad copy error:", error)
    return NextResponse.json({ error: "Erro ao gerar copy" }, { status: 500 })
  }
}
