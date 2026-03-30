import { NextResponse } from "next/server"
import { getUserProposals, createProposal, updateProposal, deleteProposal, generateProposalContent } from "@/lib/services/proposal-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const proposals = await getUserProposals(userId)
  return NextResponse.json(proposals)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, action, proposalId } = body

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (action === "delete" && proposalId) {
      await deleteProposal(userId, proposalId)
      return NextResponse.json({ success: true })
    }

    if (action === "update" && proposalId) {
      const proposal = await updateProposal(userId, proposalId, body.data)
      return NextResponse.json(proposal)
    }

    if (action === "generate") {
      // Stream AI-generated proposal
      const stream = await generateProposalContent(body.data)
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
    }

    // Create new proposal
    const proposal = await createProposal(userId, body)
    return NextResponse.json(proposal)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
