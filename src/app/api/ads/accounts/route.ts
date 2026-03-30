import { NextResponse } from "next/server"
import { getAdAccounts, connectAdAccount, disconnectAdAccount, seedDemoCampaigns } from "@/lib/services/ads-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const accounts = await getAdAccounts(userId)
  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  try {
    const { userId, platform, accountId, accountName, action, adAccountId } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (action === "disconnect" && adAccountId) {
      await disconnectAdAccount(userId, adAccountId)
      return NextResponse.json({ success: true })
    }

    if (!platform || !accountId) {
      return NextResponse.json({ error: "platform and accountId required" }, { status: 400 })
    }

    const account = await connectAdAccount(userId, platform, accountId, accountName || platform)

    // Seed demo data for testing
    if (action === "demo") {
      await seedDemoCampaigns(account.id)
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Ad account error:", error)
    return NextResponse.json({ error: "Erro ao processar conta" }, { status: 500 })
  }
}
