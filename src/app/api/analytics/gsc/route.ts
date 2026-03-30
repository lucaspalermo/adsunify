import { NextResponse } from "next/server"
import { getGSCPerformanceSummary, refreshGSCToken } from "@/lib/google-search-console"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const days = parseInt(searchParams.get("days") || "28")

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    // Find GSC connection
    const gscAccount = await db.adAccount.findFirst({
      where: { userId, platform: "GOOGLE_SEARCH_CONSOLE", isActive: true },
    })

    if (!gscAccount) {
      return NextResponse.json({ error: "GSC not connected", connected: false }, { status: 404 })
    }

    // Refresh token proactively
    let accessToken = gscAccount.accessToken
    if (gscAccount.refreshToken) {
      try {
        const refreshed = await refreshGSCToken(gscAccount.refreshToken)
        if (refreshed.access_token) {
          accessToken = refreshed.access_token
          await db.adAccount.update({
            where: { id: gscAccount.id },
            data: { accessToken: refreshed.access_token },
          })
        }
      } catch {
        // Use existing token
      }
    }

    const siteUrl = gscAccount.accountId
    const data = await getGSCPerformanceSummary(siteUrl, accessToken || "", days)

    return NextResponse.json({ connected: true, siteUrl, ...data })
  } catch (error) {
    console.error("GSC analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch GSC data" }, { status: 500 })
  }
}
