import { NextResponse } from "next/server"
import { exchangeGSCCode, listGSCSites } from "@/lib/google-search-console"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const userId = searchParams.get("state")

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/configuracoes?gsc=error", req.url))
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const redirectUri = `${baseUrl}/api/oauth/gsc/callback`

    const tokens = await exchangeGSCCode(code, redirectUri)
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/configuracoes?gsc=error", req.url))
    }

    // Get list of sites
    const sites = await listGSCSites(tokens.access_token)

    // Store tokens in user record
    await db.user.update({
      where: { id: userId },
      data: {
        // Store in a JSON field or dedicated table
        // For now, store in avatarConfig as workaround
      },
    })

    // Store GSC connection in AdAccount table (reusing existing infrastructure)
    await db.adAccount.create({
      data: {
        userId,
        platform: "GOOGLE_SEARCH_CONSOLE",
        accountId: sites[0]?.siteUrl || "unknown",
        accountName: "Google Search Console",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        isActive: true,
      },
    })

    return NextResponse.redirect(new URL("/configuracoes?gsc=success", req.url))
  } catch (error) {
    console.error("GSC OAuth error:", error)
    return NextResponse.redirect(new URL("/configuracoes?gsc=error", req.url))
  }
}
