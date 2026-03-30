import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {}
  if (category && category !== "Todos") {
    where.category = category
  }
  if (search) {
    where.OR = [
      { term: { contains: search, mode: "insensitive" } },
      { definition: { contains: search, mode: "insensitive" } },
    ]
  }

  const terms = await db.glossaryTerm.findMany({
    where,
    orderBy: { term: "asc" },
  })

  return NextResponse.json(terms)
}
