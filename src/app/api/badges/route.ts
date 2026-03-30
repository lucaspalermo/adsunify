import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const [allBadges, userBadges] = await Promise.all([
    db.badge.findMany({ orderBy: { name: "asc" } }),
    db.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    }),
  ])

  const earnedSlugs = new Set(userBadges.map(ub => ub.badge.slug))

  return NextResponse.json({
    badges: allBadges.map(b => ({
      ...b,
      earned: earnedSlugs.has(b.slug),
      earnedAt: userBadges.find(ub => ub.badge.slug === b.slug)?.earnedAt || null,
    })),
    totalEarned: userBadges.length,
    totalBadges: allBadges.length,
  })
}
