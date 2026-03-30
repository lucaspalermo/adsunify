import { anthropic, buildCopilotSystemPrompt } from "@/lib/ai"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { messages, userId, threadId } = await req.json()

    if (!userId || !messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Dados invalidos" }), { status: 400 })
    }

    // Get user context
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        businessNiche: true,
        businessUrl: true,
        businessDescription: true,
        level: true,
        levelTitle: true,
      },
    })

    // Get latest health score
    const healthScore = await db.healthScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
      select: { overallScore: true },
    })

    const systemPrompt = buildCopilotSystemPrompt({
      ...user,
      healthScore: healthScore?.overallScore,
    })

    // Format messages for Claude API
    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: formattedMessages,
    })

    // Save user message to thread
    if (threadId) {
      await db.copilotMessage.create({
        data: {
          threadId,
          role: "user",
          content: messages[messages.length - 1].content,
        },
      })
    }

    // Convert to ReadableStream for Next.js
    const encoder = new TextEncoder()
    let fullResponse = ""

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        // Save assistant response to thread
        if (threadId) {
          await db.copilotMessage.create({
            data: {
              threadId,
              role: "assistant",
              content: fullResponse,
            },
          })
        }

        // Track copilot chat action
        try {
          const { trackAction } = await import("@/lib/services/action-tracker")
          await trackAction(userId, "copilot_chat")
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
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Erro ao processar mensagem" }), { status: 500 })
  }
}
