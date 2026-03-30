import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const type = searchParams.get("type")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = { userId }
  if (type) where.type = type
  if (status) where.status = status

  const contents = await db.content.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, type: true, title: true, status: true,
      createdAt: true, updatedAt: true, publishedAt: true,
    },
  })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyCount = await db.content.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  })

  return NextResponse.json({ contents, monthlyCount })
}
