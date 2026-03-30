/**
 * Google Search Console Integration
 * Uses the Search Console API via OAuth2
 */

const GSC_SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
const GSC_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GSC_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GSC_API_BASE = "https://searchconsole.googleapis.com/webmasters/v3"

export function getGSCAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GSC_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  })
  return `${GSC_AUTH_URL}?${params.toString()}`
}

export async function exchangeGSCCode(code: string, redirectUri: string) {
  const res = await fetch(GSC_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  return res.json()
}

export async function refreshGSCToken(refreshToken: string) {
  const res = await fetch(GSC_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_ADS_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  })
  return res.json()
}

export async function listGSCSites(accessToken: string) {
  const res = await fetch(`${GSC_API_BASE}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  return data.siteEntry || []
}

interface GSCQueryParams {
  siteUrl: string
  accessToken: string
  startDate: string
  endDate: string
  dimensions?: string[]
  rowLimit?: number
}

export interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCResponse {
  rows: GSCRow[]
  responseAggregationType: string
}

export async function queryGSCAnalytics({
  siteUrl,
  accessToken,
  startDate,
  endDate,
  dimensions = ["query"],
  rowLimit = 25,
}: GSCQueryParams): Promise<GSCResponse> {
  const encodedUrl = encodeURIComponent(siteUrl)
  const res = await fetch(
    `${GSC_API_BASE}/sites/${encodedUrl}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        dataState: "all",
      }),
    }
  )
  return res.json()
}

export async function getGSCPerformanceSummary(
  siteUrl: string,
  accessToken: string,
  days: number = 28
) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const fmt = (d: Date) => d.toISOString().split("T")[0]

  // Fetch by query (top keywords)
  const [queryData, pageData, dateData] = await Promise.all([
    queryGSCAnalytics({
      siteUrl,
      accessToken,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ["query"],
      rowLimit: 20,
    }),
    queryGSCAnalytics({
      siteUrl,
      accessToken,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ["page"],
      rowLimit: 10,
    }),
    queryGSCAnalytics({
      siteUrl,
      accessToken,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ["date"],
      rowLimit: days,
    }),
  ])

  // Aggregate totals
  const totals = (dateData.rows || []).reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      impressions: acc.impressions + row.impressions,
    }),
    { clicks: 0, impressions: 0 }
  )

  const avgPosition = (queryData.rows || []).reduce((sum, r) => sum + r.position, 0) / Math.max((queryData.rows || []).length, 1)

  return {
    totals: {
      ...totals,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      avgPosition: Math.round(avgPosition * 10) / 10,
    },
    topQueries: (queryData.rows || []).map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 10000) / 100,
      position: Math.round(r.position * 10) / 10,
    })),
    topPages: (pageData.rows || []).map((r) => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 10000) / 100,
      position: Math.round(r.position * 10) / 10,
    })),
    dailyTrend: (dateData.rows || []).map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
    })),
  }
}
