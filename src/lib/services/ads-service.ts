import { db } from "@/lib/db"

// Connect an ad account (in production, this would handle OAuth flow)
export async function connectAdAccount(userId: string, platform: "GOOGLE_ADS" | "META_ADS", accountId: string, accountName: string, tokens?: { accessToken?: string; refreshToken?: string }) {
  return db.adAccount.upsert({
    where: { userId_platform_accountId: { userId, platform, accountId } },
    update: { accountName, accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken, isActive: true, lastSync: new Date() },
    create: { userId, platform, accountId, accountName, accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken },
  })
}

// Disconnect an ad account
export async function disconnectAdAccount(userId: string, adAccountId: string) {
  return db.adAccount.update({
    where: { id: adAccountId, userId },
    data: { isActive: false, accessToken: null, refreshToken: null },
  })
}

// Get user's ad accounts
export async function getAdAccounts(userId: string) {
  return db.adAccount.findMany({
    where: { userId },
    select: { id: true, platform: true, accountId: true, accountName: true, isActive: true, lastSync: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
}

// Get campaigns for an ad account (latest snapshots)
export async function getCampaigns(adAccountId: string) {
  // Get latest snapshot per campaign
  const snapshots = await db.adCampaignSnapshot.findMany({
    where: { adAccountId },
    orderBy: { snapshotAt: "desc" },
  })

  // Deduplicate by campaignId (keep latest)
  const seen = new Set<string>()
  const latest = snapshots.filter(s => {
    if (seen.has(s.campaignId)) return false
    seen.add(s.campaignId)
    return true
  })

  return latest
}

// Get aggregated ads overview stats
export async function getAdsOverview(userId: string) {
  const accounts = await db.adAccount.findMany({
    where: { userId, isActive: true },
    select: { id: true, platform: true },
  })

  if (accounts.length === 0) return { connected: false, stats: null }

  const accountIds = accounts.map(a => a.id)

  // Get all latest campaign snapshots
  const allSnapshots = await db.adCampaignSnapshot.findMany({
    where: { adAccountId: { in: accountIds } },
    orderBy: { snapshotAt: "desc" },
  })

  // Deduplicate
  const seen = new Set<string>()
  const campaigns = allSnapshots.filter(s => {
    const key = `${s.adAccountId}-${s.campaignId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  return {
    connected: true,
    platforms: accounts.map(a => a.platform),
    stats: {
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalClicks,
      totalImpressions,
      totalConversions,
      avgCpc: Math.round(avgCpc * 100) / 100,
      avgCpa: Math.round(avgCpa * 100) / 100,
      avgCtr: Math.round(avgCtr * 100) / 100,
      activeCampaigns: campaigns.filter(c => c.status === "ACTIVE").length,
      totalCampaigns: campaigns.length,
    },
    campaigns,
  }
}

// Seed demo campaigns for a connected account (for testing)
export async function seedDemoCampaigns(adAccountId: string) {
  const demoCampaigns = [
    { campaignId: "demo-1", campaignName: "Brand Awareness", status: "ACTIVE", spend: 850.50, impressions: 45200, clicks: 1230, conversions: 12, cpc: 0.69, cpa: 70.88, ctr: 2.72, roas: 1.2 },
    { campaignId: "demo-2", campaignName: "Remarketing Vendas", status: "ACTIVE", spend: 620.00, impressions: 18500, clicks: 890, conversions: 35, cpc: 0.70, cpa: 17.71, ctr: 4.81, roas: 4.5 },
    { campaignId: "demo-3", campaignName: "Prospeccao Leads", status: "ACTIVE", spend: 540.75, impressions: 32100, clicks: 780, conversions: 28, cpc: 0.69, cpa: 19.31, ctr: 2.43, roas: 3.2 },
    { campaignId: "demo-4", campaignName: "Promocao Sazonal", status: "PAUSED", spend: 328.25, impressions: 12800, clicks: 340, conversions: 8, cpc: 0.97, cpa: 41.03, ctr: 2.66, roas: 1.8 },
  ]

  for (const campaign of demoCampaigns) {
    await db.adCampaignSnapshot.create({
      data: { adAccountId, ...campaign },
    })
  }
}
