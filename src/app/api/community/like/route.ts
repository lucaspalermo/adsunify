import { NextResponse } from "next/server"
import { toggleLike } from "@/lib/services/community-service"

export async function POST(req: Request) {
  try {
    const { userId, postId } = await req.json()
    if (!userId || !postId) return NextResponse.json({ error: "userId and postId required" }, { status: 400 })

    const result = await toggleLike(userId, postId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
