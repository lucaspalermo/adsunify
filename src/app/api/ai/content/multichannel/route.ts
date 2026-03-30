import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"

const anthropic = new Anthropic()

const CHANNEL_PROMPTS: Record<string, string> = {
  blog: `Escreva um artigo de blog completo em portugues BR com:
- Titulo otimizado para SEO
- Introducao com hook
- 3-5 subtopicos com H2
- Conclusao com CTA
- Meta description (150 chars)
Formato: Markdown. Minimo 800 palavras.`,

  instagram: `Crie um post para Instagram em portugues BR com:
- Legenda (maximo 2200 chars) com emojis e storytelling
- 3 opcoes de headline
- 5 hashtags relevantes
- CTA para engajamento
- Sugestao de formato visual (carrossel, reel, single)`,

  tiktok: `Crie um roteiro de TikTok/Reels em portugues BR com:
- Hook nos primeiros 3 segundos
- Roteiro completo com falas e acoes
- Duracao ideal (15s, 30s, 60s)
- Texto overlay em cada cena
- Musica/trend sugerida
- Hashtags (5-8)`,

  youtube: `Crie um roteiro de YouTube em portugues BR com:
- Titulo clickbait (sem enganar)
- Thumbnail idea
- Script completo com intro, conteudo, CTA
- Timestamps/capitulos
- Descricao otimizada para SEO
- Tags sugeridas`,

  whatsapp: `Crie uma sequencia de mensagens para WhatsApp marketing em portugues BR com:
- Mensagem 1: Primeiro contato/boas-vindas
- Mensagem 2: Conteudo de valor (2 dias depois)
- Mensagem 3: Oferta/promocao (4 dias depois)
- Mensagem 4: Urgencia/escassez (6 dias depois)
- Mensagem 5: Follow-up final (7 dias depois)
Use linguagem conversacional, emojis moderados.`,

  email: `Crie uma sequencia de email marketing em portugues BR com:
- Subject line (maximo 50 chars, alto open rate)
- Preview text
- Corpo do email com storytelling
- CTA button text
- PS com bonus/urgencia
Crie 3 emails: boas-vindas, nurture, oferta.`,

  ads: `Crie copys de anuncio em portugues BR com:
- 3 headlines Google Ads (30 chars cada)
- 2 descricoes Google Ads (90 chars cada)
- 1 primary text Meta Ads (125 chars)
- 1 headline Meta Ads
- 1 descricao Meta Ads
- Sugestao de publico-alvo
- CTA recomendado`,
}

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { channel, topic, keywords, tone, userId, niche } = await req.json()

    if (!channel || !topic || !userId) {
      return NextResponse.json({ error: "channel, topic, userId required" }, { status: 400 })
    }

    const channelPrompt = CHANNEL_PROMPTS[channel] || CHANNEL_PROMPTS.blog

    const systemPrompt = `Voce e um especialista em marketing de conteudo digital para o mercado brasileiro.
Nicho: ${niche || "geral"}
Tom: ${tone || "profissional"}
Palavras-chave: ${keywords || "nenhuma especificada"}`

    const userPrompt = `${channelPrompt}

Topico: ${topic}

Gere o conteudo completo agora.`

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = ""
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }

        // Save to DB
        try {
          await db.content.create({
            data: {
              userId,
              type: channel.toUpperCase(),
              title: topic,
              body: fullText,
              metadata: { channel, keywords, tone, niche },
            },
          })
        } catch {}

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    })
  } catch (error) {
    console.error("Multichannel content error:", error)
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 })
  }
}
