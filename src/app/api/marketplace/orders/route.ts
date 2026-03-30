import { NextResponse } from "next/server"
import { createOrder, updateOrderStatus, addReview, getUserOrders } from "@/lib/services/marketplace-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const orders = await getUserOrders(userId)
  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  try {
    const { action, buyerId, serviceId, orderId, price, details, status, rating, review } = await req.json()

    if (action === "create" && buyerId && serviceId) {
      const order = await createOrder(buyerId, serviceId, { price, details })
      return NextResponse.json(order)
    }

    if (action === "status" && orderId && status) {
      const order = await updateOrderStatus(orderId, status)
      return NextResponse.json(order)
    }

    if (action === "review" && orderId && rating) {
      const order = await addReview(orderId, rating, review || "")
      return NextResponse.json(order)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Order error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
