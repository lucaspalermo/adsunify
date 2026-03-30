import { NextResponse } from "next/server"
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/services/notification-engine"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(userId, 20),
    getUnreadCount(userId),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function POST(req: Request) {
  try {
    const { action, notificationId, userId } = await req.json()

    if (action === "read" && notificationId) {
      await markAsRead(notificationId)
      return NextResponse.json({ success: true })
    }

    if (action === "readAll" && userId) {
      await markAllAsRead(userId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
