import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET: List all sites for a user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const sites = await db.site.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  })

  // If no sites exist, create one from user's businessUrl
  if (sites.length === 0) {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (user?.businessUrl) {
      const site = await db.site.create({
        data: {
          userId,
          name: user.businessName || user.businessUrl,
          url: user.businessUrl,
          niche: user.businessNiche || undefined,
          isPrimary: true,
        },
      })
      return NextResponse.json([site])
    }
  }

  return NextResponse.json(sites)
}

// POST: Add a new site
export async function POST(req: Request) {
  try {
    const { userId, name, url, niche, description } = await req.json()

    if (!userId || !url) {
      return NextResponse.json({ error: "userId e url sao obrigatorios" }, { status: 400 })
    }

    // Limpar URL
    const cleanUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase()

    // Verificar limite (max 10 sites)
    const count = await db.site.count({ where: { userId } })
    if (count >= 10) {
      return NextResponse.json({ error: "Limite de 10 sites atingido" }, { status: 400 })
    }

    // Se eh o primeiro site, marcar como principal
    const isPrimary = count === 0

    const site = await db.site.create({
      data: {
        userId,
        name: name || cleanUrl,
        url: cleanUrl,
        niche: niche || undefined,
        description: description || undefined,
        isPrimary,
      },
    })

    return NextResponse.json(site)
  } catch (error: any) {
    console.error("Site create error:", error)
    return NextResponse.json({ error: "Erro ao adicionar site" }, { status: 500 })
  }
}

// PATCH: Update or set primary
export async function PATCH(req: Request) {
  try {
    const { siteId, userId, action, name, niche } = await req.json()

    if (action === "set-primary" && siteId && userId) {
      // Remove primary de todos
      await db.site.updateMany({ where: { userId }, data: { isPrimary: false } })
      // Set novo primary
      const site = await db.site.update({ where: { id: siteId }, data: { isPrimary: true } })
      // Atualizar businessUrl do user
      await db.user.update({ where: { id: userId }, data: { businessUrl: site.url, businessName: site.name } })
      return NextResponse.json(site)
    }

    if (siteId) {
      const site = await db.site.update({
        where: { id: siteId },
        data: { ...(name && { name }), ...(niche && { niche }) },
      })
      return NextResponse.json(site)
    }

    return NextResponse.json({ error: "siteId required" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

// DELETE: Remove a site
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get("siteId")
  if (!siteId) return NextResponse.json({ error: "siteId required" }, { status: 400 })

  await db.site.delete({ where: { id: siteId } })
  return NextResponse.json({ success: true })
}
