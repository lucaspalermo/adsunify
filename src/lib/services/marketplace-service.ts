import { db } from "@/lib/db"

export async function getServices(options: { category?: string; search?: string; page?: number }) {
  const { category, search, page = 1 } = options
  const limit = 12
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (category && category !== "all") where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const [services, total] = await Promise.all([
    db.marketplaceService.findMany({
      where,
      include: { provider: { select: { id: true, name: true, image: true, level: true } } },
      orderBy: { rating: "desc" },
      skip,
      take: limit,
    }),
    db.marketplaceService.count({ where }),
  ])

  return { services, total, pages: Math.ceil(total / limit) }
}

export async function getServiceById(serviceId: string) {
  return db.marketplaceService.findUnique({
    where: { id: serviceId },
    include: {
      provider: { select: { id: true, name: true, image: true, level: true, levelTitle: true } },
      orders: {
        where: { review: { not: null } },
        select: { rating: true, review: true, createdAt: true, buyer: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })
}

export async function createService(providerId: string, data: {
  title: string
  description: string
  category: string
  priceMin: number
  priceMax?: number
  deliveryDays: number
}) {
  return db.marketplaceService.create({
    data: { providerId, ...data },
  })
}

export async function createOrder(buyerId: string, serviceId: string, data: { price: number; details?: unknown }) {
  return db.marketplaceOrder.create({
    data: {
      buyerId,
      serviceId,
      price: data.price,
      details: data.details ? JSON.parse(JSON.stringify(data.details)) : undefined,
    },
  })
}

export async function updateOrderStatus(orderId: string, status: string) {
  return db.marketplaceOrder.update({ where: { id: orderId }, data: { status } })
}

export async function addReview(orderId: string, rating: number, review: string) {
  const order = await db.marketplaceOrder.update({
    where: { id: orderId },
    data: { rating, review, status: "completed" },
  })

  // Update service rating average
  const allOrders = await db.marketplaceOrder.findMany({
    where: { serviceId: order.serviceId, rating: { not: null } },
    select: { rating: true },
  })

  const avgRating = allOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / allOrders.length

  await db.marketplaceService.update({
    where: { id: order.serviceId },
    data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allOrders.length },
  })

  return order
}

export async function getUserOrders(userId: string) {
  return db.marketplaceOrder.findMany({
    where: { buyerId: userId },
    include: {
      service: { select: { id: true, title: true, category: true, provider: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })
}
