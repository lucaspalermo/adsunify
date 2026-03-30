import { NextResponse } from "next/server"
import { generateMonthlyReport, getUserReports, getReportById } from "@/lib/services/report-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const reportId = searchParams.get("reportId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  if (reportId) {
    const report = await getReportById(userId, reportId)
    return NextResponse.json(report)
  }

  const reports = await getUserReports(userId)
  return NextResponse.json(reports)
}

export async function POST(req: Request) {
  try {
    const { userId, period } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const result = await generateMonthlyReport(userId, period)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatorio" }, { status: 500 })
  }
}
