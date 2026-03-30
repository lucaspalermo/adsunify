import { db } from "@/lib/db"

// Check if user has agency plan
export async function isAgencyUser(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } })
  return user?.plan === "AGENCIA" || user?.plan === "ENTERPRISE"
}

// Add a client to agency
export async function addClient(agencyId: string, data: { clientName: string; clientEmail?: string; clientUrl?: string; notes?: string }) {
  if (!await isAgencyUser(agencyId)) {
    throw new Error("Plano Agencia necessario para gerenciar clientes")
  }

  // Check limit (10 clients for AGENCIA plan)
  const clientCount = await db.agencyClient.count({ where: { agencyId } })
  if (clientCount >= 10) throw new Error("Limite de 10 clientes atingido")

  // Create a user account for the client (or link existing)
  let clientUser = data.clientEmail
    ? await db.user.findUnique({ where: { email: data.clientEmail } })
    : null

  if (!clientUser) {
    clientUser = await db.user.create({
      data: {
        name: data.clientName,
        email: data.clientEmail || `client-${Date.now()}@adsunify.com`,
        businessName: data.clientName,
        businessUrl: data.clientUrl,
      },
    })
  }

  return db.agencyClient.create({
    data: {
      agencyId,
      clientId: clientUser.id,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientUrl: data.clientUrl,
      notes: data.notes,
    },
    include: { client: { select: { id: true, name: true, email: true, businessName: true, businessUrl: true, plan: true } } },
  })
}

// Get agency clients
export async function getClients(agencyId: string) {
  return db.agencyClient.findMany({
    where: { agencyId, isActive: true },
    include: {
      client: {
        select: {
          id: true, name: true, email: true, businessName: true, businessUrl: true,
          xp: true, level: true, levelTitle: true, plan: true,
          healthScores: { orderBy: { calculatedAt: "desc" }, take: 1, select: { overallScore: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// Remove client
export async function removeClient(agencyId: string, agencyClientId: string) {
  return db.agencyClient.update({
    where: { id: agencyClientId, agencyId },
    data: { isActive: false },
  })
}

// Get client count
export async function getClientCount(agencyId: string) {
  return db.agencyClient.count({ where: { agencyId, isActive: true } })
}
