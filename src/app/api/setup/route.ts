import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { runBasicSiteAudit } from "@/lib/services/seo-service"

export async function POST(req: Request) {
  try {
    const { userId, platform, platformUrl, businessDescription, objective } = await req.json()

    // Find user
    let user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
    }
    if (!user) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })

    const realUserId = user.id

    const nicheMap: Record<string, string> = {
      site: "Site/Loja Online",
      instagram: "Instagram",
      local: "Negocio Local",
      marketplace: "Marketplace",
    }

    // Clean URL
    const cleanUrl = platformUrl?.trim() || ""
    const fullUrl = cleanUrl.startsWith("http") ? cleanUrl : cleanUrl.includes(".") ? `https://${cleanUrl}` : cleanUrl

    // Save user data
    await db.user.update({
      where: { id: realUserId },
      data: {
        businessUrl: fullUrl || cleanUrl || platform,
        businessDescription: businessDescription || null,
        businessNiche: nicheMap[platform] || platform,
        businessName: cleanUrl || "Meu Negocio",
        marketingGoals: JSON.stringify([objective]),
      },
    })

    // Run real site audit if it's a website URL
    let auditResult = null
    if (platform === "site" && fullUrl.includes(".")) {
      try {
        auditResult = await runBasicSiteAudit(realUserId, fullUrl)

        // Save health score based on REAL audit
        await db.healthScore.create({
          data: {
            userId: realUserId,
            overallScore: auditResult.score,
            seoScore: auditResult.score,
            adsScore: 0,
            contentScore: 0,
            speedScore: Math.min(100, auditResult.score + 10),
            socialScore: auditResult.issues.some((i: { title: string; severity: string }) => i.title.includes("Open Graph") && i.severity === "ok") ? 70 : 20,
          },
        })
      } catch {
        // Audit failed, save default score
        await db.healthScore.create({
          data: { userId: realUserId, overallScore: 30, seoScore: 20, adsScore: 0, contentScore: 0, speedScore: 30, socialScore: 10 },
        })
      }
    } else {
      // Non-site platform (Instagram, local, marketplace)
      await db.healthScore.create({
        data: { userId: realUserId, overallScore: 20, seoScore: 10, adsScore: 0, contentScore: 0, speedScore: 20, socialScore: 15 },
      })
    }

    // Welcome notification
    await db.notification.create({
      data: {
        userId: realUserId,
        type: "welcome",
        title: "Bem-vindo ao AdsUnify!",
        body: auditResult
          ? `Auditamos seu site e encontramos score ${auditResult.score}/100. Veja seu plano personalizado!`
          : "Seu plano de marketing foi criado. Comece pelas acoes do Passo 1!",
        actionUrl: "/painel",
        actionLabel: "Ver meu plano",
      },
    })

    // Generate initial missions
    try {
      const { generateWeeklyMissions } = await import("@/lib/services/mission-engine")
      await generateWeeklyMissions(realUserId)
    } catch {
      // missions generation optional
    }

    return NextResponse.json({
      success: true,
      audit: auditResult ? { score: auditResult.score, issues: auditResult.issues } : null,
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}
