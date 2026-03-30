import { NextResponse } from "next/server"
import { getFeed, createPost } from "@/lib/services/community-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") || undefined
  const page = parseInt(searchParams.get("page") || "1")

  const feed = await getFeed({ category, page })
  return NextResponse.json(feed)
}

export async function POST(req: Request) {
  try {
    const { userId, title, body, category } = await req.json()
    if (!userId || !title || !body) {
      return NextResponse.json({ error: "userId, title, and body required" }, { status: 400 })
    }

    const post = await createPost(userId, { title, body, category: category || "tip" })
    return NextResponse.json(post)
  } catch (error) {
    console.error("Post error:", error)
    return NextResponse.json({ error: "Erro ao criar post" }, { status: 500 })
  }
}
