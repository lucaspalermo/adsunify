import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET: Get white-label config for agency
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (user.plan !== "AGENCIA") {
      return NextResponse.json({ error: "Plano Agencia necessario para white-label" }, { status: 403 })
    }

    // Get agency clients
    const clients = await db.agencyClient.findMany({
      where: { agencyId: userId },
      include: { client: { select: { name: true, email: true, businessUrl: true, businessNiche: true } } },
    })

    return NextResponse.json({
      agency: {
        name: user.name,
        plan: user.plan,
        customBranding: user.avatarConfig || {},
      },
      clients: clients.map((c) => ({
        id: c.id,
        clientId: c.clientId,
        name: c.client.name,
        email: c.client.email,
        url: c.client.businessUrl,
        niche: c.client.businessNiche,
        addedAt: c.createdAt,
      })),
      limits: {
        maxClients: 20,
        currentClients: clients.length,
        remaining: 20 - clients.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

// POST: Add a client to agency
export async function POST(req: Request) {
  try {
    const { agencyUserId, clientEmail, clientName } = await req.json()

    if (!agencyUserId || !clientEmail) {
      return NextResponse.json({ error: "agencyUserId, clientEmail required" }, { status: 400 })
    }

    const agency = await db.user.findUnique({ where: { id: agencyUserId } })
    if (!agency || agency.plan !== "AGENCIA") {
      return NextResponse.json({ error: "Plano Agencia necessario" }, { status: 403 })
    }

    // Check client limit
    const clientCount = await db.agencyClient.count({ where: { agencyId: agencyUserId } })
    if (clientCount >= 20) {
      return NextResponse.json({ error: "Limite de 20 clientes atingido" }, { status: 400 })
    }

    // Find or create client user
    let client = await db.user.findUnique({ where: { email: clientEmail } })
    if (!client) {
      const bcrypt = await import("bcryptjs")
      const tempPassword = await bcrypt.hash("temp123", 10)
      client = await db.user.create({
        data: {
          email: clientEmail,
          name: clientName || clientEmail.split("@")[0],
          password: tempPassword,
          plan: "STARTER",
        },
      })
    }

    // Link to agency
    const link = await db.agencyClient.create({
      data: { agencyId: agencyUserId, clientId: client.id, clientName: clientName || client.name || clientEmail },
    })

    return NextResponse.json({ success: true, clientId: client.id, linkId: link.id })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Cliente ja vinculado" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 })
  }
}
