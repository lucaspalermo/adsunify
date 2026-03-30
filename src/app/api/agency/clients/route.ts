import { NextResponse } from "next/server"
import { getClients, addClient, removeClient } from "@/lib/services/agency-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    const clients = await getClients(userId)
    return NextResponse.json(clients)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, action, agencyClientId, ...data } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (action === "remove" && agencyClientId) {
      await removeClient(userId, agencyClientId)
      return NextResponse.json({ success: true })
    }

    const client = await addClient(userId, data)
    return NextResponse.json(client)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
