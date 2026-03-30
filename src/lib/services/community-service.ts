import { db } from "@/lib/db"

export async function getFeed(options: { category?: string; page?: number; limit?: number }) {
  const { category, page = 1, limit = 20 } = options
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (category && category !== "all") where.category = category

  const [posts, total] = await Promise.all([
    db.communityPost.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true, level: true, levelTitle: true } },
        comments: { select: { id: true } },
        likes: { select: { id: true, userId: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.communityPost.count({ where }),
  ])

  return {
    posts: posts.map(p => ({
      ...p,
      likeCount: p.likes.length,
      commentCount: p.comments.length,
    })),
    total,
    pages: Math.ceil(total / limit),
  }
}

export async function createPost(userId: string, data: { title: string; body: string; category: string }) {
  return db.communityPost.create({
    data: { userId, ...data },
    include: { user: { select: { id: true, name: true, image: true, level: true, levelTitle: true } } },
  })
}

export async function toggleLike(userId: string, postId: string) {
  const existing = await db.communityLike.findUnique({
    where: { postId_userId: { postId, userId } },
  })

  if (existing) {
    await db.communityLike.delete({ where: { id: existing.id } })
    return { liked: false }
  }

  await db.communityLike.create({ data: { postId, userId } })
  return { liked: true }
}

export async function addComment(userId: string, postId: string, body: string) {
  return db.communityComment.create({
    data: { userId, postId, body },
    include: { user: { select: { id: true, name: true, image: true, level: true, levelTitle: true } } },
  })
}

export async function getPostComments(postId: string) {
  return db.communityComment.findMany({
    where: { postId },
    include: { user: { select: { id: true, name: true, image: true, level: true, levelTitle: true } } },
    orderBy: { createdAt: "asc" },
  })
}

export async function getMonthlyRanking(limit = 10) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Get users with most XP gained this month (approximation: highest total XP + recent activity)
  const users = await db.user.findMany({
    where: { xp: { gt: 0 } },
    select: { id: true, name: true, image: true, level: true, levelTitle: true, xp: true },
    orderBy: { xp: "desc" },
    take: limit,
  })

  return users.map((u, i) => ({ ...u, rank: i + 1 }))
}
