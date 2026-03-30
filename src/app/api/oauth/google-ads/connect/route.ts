import { NextResponse } from "next/server"
import { getGoogleAdsAuthUrl } from "@/lib/google-ads-oauth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId") || "demo"

  // Resolve real user
  let user = await db.user.findUnique({ where: { id: userId } })
  if (!user) user = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const authUrl = getGoogleAdsAuthUrl(user.id)
  return NextResponse.redirect(authUrl)
}
