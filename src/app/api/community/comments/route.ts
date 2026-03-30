import { NextResponse } from "next/server"
import { addComment, getPostComments } from "@/lib/services/community-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("postId")
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 })

  const comments = await getPostComments(postId)
  return NextResponse.json(comments)
}

export async function POST(req: Request) {
  try {
    const { userId, postId, body } = await req.json()
    if (!userId || !postId || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const comment = await addComment(userId, postId, body)
    return NextResponse.json(comment)
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
