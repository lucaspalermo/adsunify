import { NextResponse } from "next/server"
import { getServices, getServiceById, createService } from "@/lib/services/marketplace-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get("serviceId")

  if (serviceId) {
    const service = await getServiceById(serviceId)
    return NextResponse.json(service)
  }

  const category = searchParams.get("category") || undefined
  const search = searchParams.get("search") || undefined
  const page = parseInt(searchParams.get("page") || "1")

  const result = await getServices({ category, search, page })
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  try {
    const { providerId, ...data } = await req.json()
    if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 })

    const service = await createService(providerId, data)
    return NextResponse.json(service)
  } catch (error) {
    console.error("Service error:", error)
    return NextResponse.json({ error: "Erro ao criar servico" }, { status: 500 })
  }
}
