import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { fetchGoogleAdsCampaigns, refreshGoogleToken } from "@/lib/google-ads-oauth"
import { fetchMetaCampaigns } from "@/lib/meta-ads-oauth"
import { anthropic } from "@/lib/ai"

async function resolveUserId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user) return user.id
  const fallback = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  return fallback?.id || null
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    const realId = await resolveUserId(userId || "demo")
    if (!realId) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const accounts = await db.adAccount.findMany({ where: { userId: realId, isActive: true } })
    const results: Array<{ platform: string; campaigns: number; error?: string }> = []

    for (const account of accounts) {
      try {
        if (account.platform === "GOOGLE_ADS" && account.accessToken && account.refreshToken) {
          // Refresh token first
          const newToken = await refreshGoogleToken(account.refreshToken)
          await db.adAccount.update({ where: { id: account.id }, data: { accessToken: newToken.access_token, lastSync: new Date() } })

          // Fetch campaigns
          const data = await fetchGoogleAdsCampaigns(newToken.access_token, account.accountId)

          // Save snapshots
          let campCount = 0
          for (const result of (data || [])) {
            for (const row of (result.results || [])) {
              const c = row.campaign
              const m = row.metrics
              await db.adCampaignSnapshot.create({
                data: {
                  adAccountId: account.id,
                  campaignId: c.id,
                  campaignName: c.name,
                  status: c.status,
                  spend: (m.costMicros || 0) / 1000000,
                  impressions: parseInt(m.impressions || "0"),
                  clicks: parseInt(m.clicks || "0"),
                  conversions: parseInt(m.conversions || "0"),
                  cpc: m.averageCpc ? m.averageCpc / 1000000 : null,
                  ctr: m.ctr ? parseFloat(m.ctr) : null,
                },
              })
              campCount++
            }
          }
          results.push({ platform: "GOOGLE_ADS", campaigns: campCount })
        }

        if (account.platform === "META_ADS" && account.accessToken) {
          const data = await fetchMetaCampaigns(account.accessToken, account.accountId)

          let campCount = 0
          for (const camp of (data.data || [])) {
            const insights = camp.insights?.data?.[0]
            await db.adCampaignSnapshot.create({
              data: {
                adAccountId: account.id,
                campaignId: camp.id,
                campaignName: camp.name,
                status: camp.status,
                spend: parseFloat(insights?.spend || "0"),
                impressions: parseInt(insights?.impressions || "0"),
                clicks: parseInt(insights?.clicks || "0"),
                conversions: 0,
                cpc: insights?.cpc ? parseFloat(insights.cpc) : null,
                ctr: insights?.ctr ? parseFloat(insights.ctr) : null,
              },
            })
            campCount++
          }
          results.push({ platform: "META_ADS", campaigns: campCount })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro"
        results.push({ platform: account.platform, campaigns: 0, error: msg })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Erro ao sincronizar" }, { status: 500 })
  }
}
