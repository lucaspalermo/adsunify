import { anthropic } from "@/lib/ai"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { type, topic, keywords, tone, userId } = await req.json()

    if (!type || !topic || !userId) {
      return new Response(JSON.stringify({ error: "Dados invalidos" }), { status: 400 })
    }

    const prompts: Record<string, string> = {
      ARTICLE: `Escreva um artigo de blog completo e otimizado para SEO sobre: "${topic}"

Palavras-chave para incluir: ${keywords || "relacionadas ao tema"}
Tom: ${tone || "profissional e acessivel"}

Requisitos:
- Titulo atrativo com a palavra-chave principal
- Meta description (max 160 caracteres)
- Pelo menos 3 subtitulos (H2)
- Paragrafos curtos (max 3-4 linhas)
- Inclua uma conclusao com call-to-action
- Entre 800-1200 palavras
- Linguagem simples, sem jargoes

Formato da resposta:
**Titulo:** [titulo]
**Meta Description:** [meta description]
**Slug sugerido:** [slug]

---

[conteudo do artigo em markdown]`,

      SOCIAL_POST: `Crie um post para Instagram sobre: "${topic}"

Requisitos:
- Legenda atrativa (max 2200 caracteres)
- Comece com um gancho que prenda atencao
- Use emojis estrategicamente
- Inclua call-to-action no final
- Sugira 15-20 hashtags relevantes
- Tom: ${tone || "engajador e acessivel"}`,

      AD_COPY: `Crie 3 variacoes de texto de anuncio sobre: "${topic}"

Para cada variacao, crie:
- Titulo (max 30 caracteres)
- Descricao (max 90 caracteres)
- Titulo longo (max 90 caracteres)
- Call-to-action sugerido

Tom: ${tone || "persuasivo e direto"}
Palavras-chave: ${keywords || "relacionadas ao tema"}`,

      EMAIL: `Crie um email marketing sobre: "${topic}"

Requisitos:
- Linha de assunto atrativa (max 50 caracteres)
- Preview text (max 100 caracteres)
- Corpo do email estruturado
- Call-to-action claro
- Tom: ${tone || "profissional e amigavel"}
- Mantenha curto (max 300 palavras)`,
    }

    const prompt = prompts[type] || prompts.ARTICLE

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      system: "Voce eh um especialista em marketing de conteudo brasileiro. Escreva sempre em portugues brasileiro, com linguagem simples e acessivel. Seu objetivo eh criar conteudo que gere resultados reais para pequenos negocios.",
    })

    const encoder = new TextEncoder()
    let fullContent = ""

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text
            fullContent += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        // Save generated content
        await db.content.create({
          data: {
            userId,
            type: type as any,
            title: topic,
            body: fullContent,
            metadata: { keywords, tone },
            aiPrompt: prompt,
            aiModel: "claude-sonnet-4-20250514",
          },
        })

        // Track action for mission completion
        try {
          const { trackAction } = await import("@/lib/services/action-tracker")
          await trackAction(userId, "generate_content")
        } catch {}

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Content generation error:", error)
    return new Response(JSON.stringify({ error: "Erro ao gerar conteudo" }), { status: 500 })
  }
}
