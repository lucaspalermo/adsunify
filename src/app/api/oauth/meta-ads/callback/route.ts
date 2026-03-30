import { NextResponse } from "next/server"
import { exchangeMetaCode, getLongLivedToken, fetchMetaAdAccounts } from "@/lib/meta-ads-oauth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const userId = searchParams.get("state")

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/anuncios?error=missing_params", req.url))
  }

  try {
    // Exchange code for short-lived token
    const shortToken = await exchangeMetaCode(code)

    // Exchange for long-lived token (60 days)
    const longToken = await getLongLivedToken(shortToken.access_token)

    // Get ad accounts
    const accounts = await fetchMetaAdAccounts(longToken.access_token)
    const account = accounts.data?.[0]

    if (account) {
      await db.adAccount.upsert({
        where: { userId_platform_accountId: { userId, platform: "META_ADS", accountId: account.id } },
        update: { accessToken: longToken.access_token, accountName: account.name, isActive: true, lastSync: new Date() },
        create: { userId, platform: "META_ADS", accountId: account.id, accountName: account.name || "Meta Ads", accessToken: longToken.access_token },
      })
    }

    await db.notification.create({
      data: { userId, type: "integration", title: "Meta Ads conectado!", body: `Conta ${account?.name || "Meta"} conectada com sucesso.`, actionUrl: "/anuncios" },
    })

    return NextResponse.redirect(new URL("/anuncios?success=meta", req.url))
  } catch (error) {
    console.error("Meta Ads OAuth error:", error)
    return NextResponse.redirect(new URL("/anuncios?error=oauth_failed", req.url))
  }
}
