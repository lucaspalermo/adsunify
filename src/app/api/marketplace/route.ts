import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET: List marketplace services
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")

  try {
    const where: any = { isActive: true }
    if (category) where.category = category

    const [services, total] = await Promise.all([
      db.marketplaceService.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          provider: { select: { name: true, level: true } },
        },
      }),
      db.marketplaceService.count({ where }),
    ])

    return NextResponse.json({
      services,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

// POST: Create a marketplace service listing
export async function POST(req: Request) {
  try {
    const { userId, title, description, category, price, deliveryDays } = await req.json()

    if (!userId || !title || !price) {
      return NextResponse.json({ error: "userId, title, price required" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Only Pro+ plans can list services
    if (!["PRO", "AGENCIA"].includes(user.plan || "")) {
      return NextResponse.json({ error: "Plano Pro ou superior necessario para listar servicos" }, { status: 403 })
    }

    const service = await db.marketplaceService.create({
      data: {
        providerId: userId,
        title,
        description: description || "",
        category: category || "geral",
        priceMin: price,
        deliveryDays: deliveryDays || 7,
        isActive: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
