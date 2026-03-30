import { NextResponse } from "next/server"
import { addTrackedKeyword, removeTrackedKeyword, getTrackedKeywords } from "@/lib/services/seo-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const keywords = await getTrackedKeywords(userId)
  return NextResponse.json(keywords)
}

export async function POST(req: Request) {
  try {
    const { userId, keyword, action, keywordId } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (action === "remove" && keywordId) {
      await removeTrackedKeyword(userId, keywordId)
      return NextResponse.json({ success: true })
    }

    if (!keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 })

    const tracked = await addTrackedKeyword(userId, keyword)

    // Track action
    try {
      const { trackAction } = await import("@/lib/services/action-tracker")
      await trackAction(userId, "add_keywords")
    } catch {}

    return NextResponse.json(tracked)
  } catch (error) {
    console.error("Keyword error:", error)
    return NextResponse.json({ error: "Erro ao processar keyword" }, { status: 500 })
  }
}
