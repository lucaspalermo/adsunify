import { db } from "@/lib/db"
import { checkCompetitorLimit } from "@/lib/services/plan-limits"
import { createNotification } from "@/lib/services/notification-engine"

// Add a competitor to track
export async function addCompetitor(userId: string, name: string, domain: string) {
  // Check plan limits
  const limit = await checkCompetitorLimit(userId)
  if (!limit.allowed) {
    throw new Error(`Limite de concorrentes atingido (${limit.limit}). Faca upgrade do seu plano.`)
  }

  // Normalize domain
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase()

  const competitor = await db.competitor.create({
    data: { userId, name, domain: cleanDomain },
  })

  // Create initial snapshot with placeholder data
  // In production, this would call DataForSEO or similar API
  await createInitialSnapshot(competitor.id)

  return competitor
}

// Remove a competitor
export async function removeCompetitor(userId: string, competitorId: string) {
  return db.competitor.delete({ where: { id: competitorId, userId } })
}

// Get all competitors for a user
export async function getCompetitors(userId: string) {
  const competitors = await db.competitor.findMany({
    where: { userId },
    include: {
      snapshots: { orderBy: { snapshotAt: "desc" }, take: 2 },
      alerts: { where: { isRead: false }, orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  })

  return competitors.map(c => {
    const latest = c.snapshots[0]
    const previous = c.snapshots[1]

    return {
      id: c.id,
      name: c.name,
      domain: c.domain,
      createdAt: c.createdAt,
      metrics: {
        domainAuth: latest?.domainAuth || 0,
        backlinks: latest?.backlinks || 0,
        organicKw: latest?.organicKw || 0,
        traffic: latest?.traffic || 0,
      },
      changes: {
        domainAuth: (latest?.domainAuth || 0) - (previous?.domainAuth || 0),
        backlinks: (latest?.backlinks || 0) - (previous?.backlinks || 0),
        organicKw: (latest?.organicKw || 0) - (previous?.organicKw || 0),
        traffic: (latest?.traffic || 0) - (previous?.traffic || 0),
      },
      topKeywords: latest?.topKeywords || [],
      unreadAlerts: c.alerts.length,
      alerts: c.alerts,
    }
  })
}

// Get comparison data for radar chart (user vs competitor)
export async function getComparisonData(userId: string, competitorId: string) {
  const competitor = await db.competitor.findFirst({
    where: { id: competitorId, userId },
    include: { snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 } },
  })

  if (!competitor) throw new Error("Concorrente nao encontrado")

  // Get user's own metrics
  const userKeywords = await db.trackedKeyword.count({ where: { userId } })
  const userContent = await db.content.count({ where: { userId } })
  const userHealthScore = await db.healthScore.findFirst({
    where: { userId },
    orderBy: { calculatedAt: "desc" },
    select: { seoScore: true, contentScore: true, speedScore: true, socialScore: true },
  })

  const snapshot = competitor.snapshots[0]

  return {
    user: {
      name: "Voce",
      seo: userHealthScore?.seoScore || 30,
      content: Math.min(100, (userContent / 20) * 100),
      speed: userHealthScore?.speedScore || 50,
      social: userHealthScore?.socialScore || 40,
      backlinks: Math.min(100, (userKeywords / 50) * 100),
    },
    competitor: {
      name: competitor.name,
      seo: snapshot ? Math.min(100, (snapshot.domainAuth || 0) * 2) : 50,
      content: snapshot ? Math.min(100, (snapshot.organicKw || 0) / 5) : 60,
      speed: 65, // placeholder
      social: 55, // placeholder
      backlinks: snapshot ? Math.min(100, (snapshot.backlinks || 0) / 100) : 45,
    },
  }
}

// Create initial snapshot for a new competitor
async function createInitialSnapshot(competitorId: string) {
  // In production, fetch real data from DataForSEO, SEMrush, etc.
  // For now, generate reasonable placeholder data
  const da = Math.floor(Math.random() * 40) + 15
  const backlinks = Math.floor(Math.random() * 500) + 50
  const organicKw = Math.floor(Math.random() * 300) + 30
  const traffic = Math.floor(Math.random() * 15000) + 1000

  return db.competitorSnapshot.create({
    data: {
      competitorId,
      domainAuth: da,
      backlinks,
      organicKw,
      traffic,
      topKeywords: [],
      techStack: [],
    },
  })
}

// Get competitor alerts
export async function getCompetitorAlerts(userId: string) {
  const competitors = await db.competitor.findMany({
    where: { userId },
    select: { id: true },
  })

  const competitorIds = competitors.map(c => c.id)

  return db.competitorAlert.findMany({
    where: { competitorId: { in: competitorIds } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { competitor: { select: { name: true, domain: true } } },
  })
}

// Mark alert as read
export async function markAlertRead(alertId: string) {
  return db.competitorAlert.update({ where: { id: alertId }, data: { isRead: true } })
}

// Simulate competitor check (in production, this would be a cron job)
export async function checkCompetitorUpdates(userId: string) {
  const competitors = await db.competitor.findMany({
    where: { userId },
    include: { snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 } },
  })

  for (const competitor of competitors) {
    const prev = competitor.snapshots[0]
    if (!prev) continue

    // Simulate some changes
    const trafficChange = Math.floor(Math.random() * 2000) - 500
    const kwChange = Math.floor(Math.random() * 20) - 5

    const newSnapshot = await db.competitorSnapshot.create({
      data: {
        competitorId: competitor.id,
        domainAuth: prev.domainAuth,
        backlinks: (prev.backlinks || 0) + Math.floor(Math.random() * 10),
        organicKw: (prev.organicKw || 0) + kwChange,
        traffic: (prev.traffic || 0) + trafficChange,
        topKeywords: prev.topKeywords ?? [],
        techStack: prev.techStack ?? [],
      },
    })

    // Create alerts for significant changes
    if (trafficChange > 1000) {
      await db.competitorAlert.create({
        data: {
          competitorId: competitor.id,
          type: "traffic_increase",
          title: `${competitor.name} teve aumento de trafego`,
          details: { trafficChange, newTraffic: newSnapshot.traffic },
        },
      })

      await createNotification(userId, {
        type: "competitor_alert",
        title: `Alerta: ${competitor.name}`,
        body: `${competitor.name} teve um aumento significativo de trafego (+${trafficChange} visitas)`,
        actionUrl: "/concorrentes",
        actionLabel: "Ver detalhes",
      })
    }
  }
}
