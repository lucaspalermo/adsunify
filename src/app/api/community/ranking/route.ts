import { NextResponse } from "next/server"
import { getMonthlyRanking } from "@/lib/services/community-service"

export async function GET() {
  const ranking = await getMonthlyRanking()
  return NextResponse.json(ranking)
}
