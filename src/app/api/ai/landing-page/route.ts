import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { businessName, niche, product, targetAudience, style, userId } = await req.json()

    if (!businessName || !userId) {
      return NextResponse.json({ error: "businessName and userId required" }, { status: 400 })
    }

    const prompt = `Voce e um designer/developer expert em landing pages de alta conversao.

Crie o HTML + Tailwind CSS completo de uma landing page para:

Negocio: ${businessName}
Nicho: ${niche || "geral"}
Produto/Servico: ${product || "nao especificado"}
Publico-alvo: ${targetAudience || "geral"}
Estilo: ${style || "moderno e profissional"}

A landing page deve ter:
1. Hero section com headline forte e CTA
2. Social proof (numeros, logos, depoimentos)
3. Problema/Solucao (antes/depois)
4. Beneficios (3-6 cards)
5. Como funciona (3 passos)
6. Depoimentos (3 cards)
7. FAQ (4-5 perguntas)
8. CTA final com urgencia
9. Footer simples

Requisitos:
- HTML completo com Tailwind CDN
- Mobile responsive
- Design moderno com gradientes
- Cores profissionais do nicho
- Textos reais e persuasivos (nao lorem ipsum)
- WhatsApp CTA button
- Animacoes CSS simples

Responda SOMENTE com o HTML completo, nada mais.`

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
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

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    })
  } catch (error) {
    console.error("Landing page generation error:", error)
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 })
  }
}
