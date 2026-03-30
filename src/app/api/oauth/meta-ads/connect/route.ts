import { NextResponse } from "next/server"
import { getMetaAdsAuthUrl } from "@/lib/meta-ads-oauth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId") || "demo"

  let user = await db.user.findUnique({ where: { id: userId } })
  if (!user) user = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const authUrl = getMetaAdsAuthUrl(user.id)
  return NextResponse.redirect(authUrl)
}
