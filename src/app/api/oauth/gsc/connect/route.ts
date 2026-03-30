import { NextResponse } from "next/server"
import { getGSCAuthUrl } from "@/lib/google-search-console"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/oauth/gsc/callback`

  const authUrl = getGSCAuthUrl(redirectUri, userId)
  return NextResponse.redirect(authUrl)
}
