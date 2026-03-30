import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * AdsUnify Public API v1
 * Endpoints for external integrations
 */

// API key validation — uses user email + password hash as simple API key
// Format: base64(email:id)
async function validateApiKey(req: Request) {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "")
  if (!apiKey) return null

  try {
    const decoded = Buffer.from(apiKey, "base64").toString("utf-8")
    const [email, userId] = decoded.split(":")
    if (!email || !userId) return null

    const user = await db.user.findFirst({
      where: { id: userId, email },
      select: { id: true, plan: true, name: true },
    })

    return user
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const user = await validateApiKey(req)
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key", docs: "https://adsunify.com/api/docs" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const resource = searchParams.get("resource")

  try {
    if (resource === "health-score") {
      const score = await db.healthScore.findFirst({
        where: { userId: user.id },
        orderBy: { calculatedAt: "desc" },
      })
      return NextResponse.json({ score })
    }

    if (resource === "keywords") {
      const keywords = await db.trackedKeyword.findMany({
        where: { userId: user.id },
        include: { rankings: { orderBy: { checkedAt: "desc" }, take: 1 } },
      })
      return NextResponse.json({
        keywords: keywords.map((kw) => ({
          keyword: kw.keyword,
          position: kw.rankings[0]?.position || null,
          location: kw.location,
        })),
      })
    }

    if (resource === "competitors") {
      const competitors = await db.competitor.findMany({
        where: { userId: user.id },
        include: { snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 } },
      })
      return NextResponse.json({
        competitors: competitors.map((c) => ({
          name: c.name,
          domain: c.domain,
          metrics: c.snapshots[0] || null,
        })),
      })
    }

    if (resource === "content") {
      const content = await db.content.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, type: true, title: true, createdAt: true },
      })
      return NextResponse.json({ content })
    }

    // Default: API info
    return NextResponse.json({
      api: "AdsUnify Public API",
      version: "1.0",
      user: user.name,
      plan: user.plan,
      endpoints: {
        "health-score": "GET ?resource=health-score",
        keywords: "GET ?resource=keywords",
        competitors: "GET ?resource=competitors",
        content: "GET ?resource=content",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
