import { NextResponse } from "next/server"
import { exchangeGoogleCode, fetchGoogleAdsCustomers } from "@/lib/google-ads-oauth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const userId = searchParams.get("state")

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/anuncios?error=missing_params", req.url))
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code)

    // Get accessible customer IDs
    const customers = await fetchGoogleAdsCustomers(tokens.access_token)
    const customerId = customers.resourceNames?.[0]?.replace("customers/", "") || "unknown"

    // Save ad account
    await db.adAccount.upsert({
      where: { userId_platform_accountId: { userId, platform: "GOOGLE_ADS", accountId: customerId } },
      update: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isActive: true, lastSync: new Date() },
      create: { userId, platform: "GOOGLE_ADS", accountId: customerId, accountName: `Google Ads ${customerId}`, accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
    })

    // Create notification
    await db.notification.create({
      data: { userId, type: "integration", title: "Google Ads conectado!", body: `Conta ${customerId} conectada com sucesso.`, actionUrl: "/anuncios" },
    })

    return NextResponse.redirect(new URL("/anuncios?success=google", req.url))
  } catch (error) {
    console.error("Google Ads OAuth error:", error)
    return NextResponse.redirect(new URL("/anuncios?error=oauth_failed", req.url))
  }
}
