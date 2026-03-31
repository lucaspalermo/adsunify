import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const selectFields = {
    id: true, name: true, email: true, image: true,
    businessName: true, businessNiche: true, businessUrl: true, businessDescription: true,
    monthlyBudget: true, marketingGoals: true,
    xp: true, level: true, levelTitle: true, streakDays: true,
    plan: true, planExpiresAt: true, avatarConfig: true,
    createdAt: true,
  }

  // Try by ID first, then by email
  let user = await db.user.findUnique({ where: { id: userId }, select: selectFields })

  if (!user && userId.includes("@")) {
    user = await db.user.findUnique({ where: { email: userId }, select: selectFields })
  }
  if (!user) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  try {
    const { userId, ...data } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const allowedFields = ["name", "businessName", "businessNiche", "businessUrl", "businessDescription", "monthlyBudget", "marketingGoals"]
    const updateData: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key]
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}
