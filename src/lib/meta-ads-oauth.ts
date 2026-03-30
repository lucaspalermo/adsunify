const META_APP_ID = process.env.META_ADS_APP_ID || ""
const META_APP_SECRET = process.env.META_ADS_APP_SECRET || ""
const META_REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/oauth/meta-ads/callback"

export function getMetaAdsAuthUrl(userId: string) {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: META_REDIRECT_URI,
    scope: "ads_management,ads_read,pages_show_list,business_management",
    response_type: "code",
    state: userId,
  })
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
}

export async function exchangeMetaCode(code: string) {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: META_REDIRECT_URI,
    client_secret: META_APP_SECRET,
    code,
  })
  const res = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`)
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>
}

export async function getLongLivedToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: META_APP_ID,
    client_secret: META_APP_SECRET,
    fb_exchange_token: shortToken,
  })
  const res = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`)
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>
}

export async function fetchMetaAdAccounts(accessToken: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency,balance&access_token=${accessToken}`)
  return res.json() as Promise<{ data: Array<{ id: string; name: string; account_status: number; currency: string; balance: string }> }>
}

export async function fetchMetaCampaigns(accessToken: string, adAccountId: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,insights{spend,impressions,clicks,conversions,cpc,cpm,ctr,actions}&access_token=${accessToken}`)
  return res.json() as Promise<{ data: Array<{ id: string; name: string; status: string; objective: string; daily_budget: string; insights?: { data: Array<{ spend: string; impressions: string; clicks: string; cpc: string; ctr: string }> } }> }>
}

export async function fetchMetaAdInsights(accessToken: string, adAccountId: string, dateRange: string = "last_30d") {
  const res = await fetch(`https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type&date_preset=${dateRange}&access_token=${accessToken}`)
  return res.json()
}
