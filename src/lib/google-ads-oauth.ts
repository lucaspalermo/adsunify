const GOOGLE_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || ""
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/oauth/google-ads/callback"
const GOOGLE_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ""

export function getGoogleAdsAuthUrl(userId: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/adwords",
    access_type: "offline",
    prompt: "consent",
    state: userId,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  })
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>
}

export async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  })
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

export async function fetchGoogleAdsCampaigns(accessToken: string, customerId: string) {
  const query = `SELECT campaign.id, campaign.name, campaign.status, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions, metrics.ctr, metrics.average_cpc FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY metrics.cost_micros DESC LIMIT 50`

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "developer-token": GOOGLE_DEVELOPER_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  )
  return res.json()
}

export async function fetchGoogleAdsCustomers(accessToken: string) {
  const res = await fetch(
    "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "developer-token": GOOGLE_DEVELOPER_TOKEN,
      },
    }
  )
  return res.json() as Promise<{ resourceNames: string[] }>
}
