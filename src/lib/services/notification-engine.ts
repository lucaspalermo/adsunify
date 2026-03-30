import { db } from "@/lib/db"

export async function createNotification(
  userId: string,
  data: { type: string; title: string; body: string; actionUrl?: string; actionLabel?: string }
) {
  return db.notification.create({ data: { userId, ...data } })
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, isRead: false } })
}

export async function markAsRead(notificationId: string) {
  return db.notification.update({ where: { id: notificationId }, data: { isRead: true } })
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
}

export async function getUserNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}
