import { db } from "@/lib/db"

export interface Opportunity {
  id: string
  type: "keyword_gap" | "content_idea" | "competitor_change" | "ranking_drop" | "budget_optimization" | "quick_win"
  title: string
  description: string
  impact: "alto" | "medio" | "baixo"
  impactScore: number // 1-10
  actionUrl: string
  category: string
  createdAt: Date
}

/**
 * Proactive AI Opportunity Radar
 * Scans user data and generates actionable opportunities
 */
export async function scanOpportunities(userId: string): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = []

  const [user, keywords, healthScore, competitors, recentContent, missions] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.trackedKeyword.findMany({
      where: { userId },
      include: { rankings: { orderBy: { checkedAt: "desc" }, take: 2 } },
    }),
    db.healthScore.findFirst({ where: { userId }, orderBy: { calculatedAt: "desc" } }),
    db.competitor.findMany({ where: { userId } }),
    db.content.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.userMission.findMany({ where: { userId, status: "ACTIVE" } }),
  ])

  // 1. Ranking drops — keywords that lost positions
  for (const kw of keywords.slice(0, 20)) {
    const latest = kw.rankings[0]?.position
    const prev = kw.rankings[1]?.position
    if (latest && prev && latest > prev + 2) {
      const drop = latest - prev
      opportunities.push({
        id: `ranking-drop-${kw.id}`,
        type: "ranking_drop",
        title: `"${kw.keyword}" caiu ${drop} posicoes`,
        description: `Sua palavra-chave "${kw.keyword}" caiu da posicao ${prev} para ${latest}. Atualize o conteudo relacionado.`,
        impact: drop > 5 ? "alto" : "medio",
        impactScore: Math.min(10, drop),
        actionUrl: "/seo",
        category: "SEO",
        createdAt: new Date(),
      })
      if (opportunities.filter(o => o.type === "ranking_drop").length >= 3) break
    }
  }

  // 2. Keywords close to top 10 — almost there
  const almostTop10 = keywords.filter((kw) => {
    const pos = kw.rankings[0]?.position
    return pos && pos > 10 && pos <= 20
  })
  for (const kw of almostTop10.slice(0, 3)) {
    const pos = kw.rankings[0]!.position
    opportunities.push({
      id: `almost-top10-${kw.id}`,
      type: "keyword_gap",
      title: `"${kw.keyword}" esta na posicao ${pos} — quase no top 10!`,
      description: `Com pequenas otimizacoes no conteudo, voce pode subir essa keyword para a primeira pagina do Google.`,
      impact: "alto",
      impactScore: 8,
      actionUrl: "/seo",
      category: "SEO",
      createdAt: new Date(),
    })
  }

  // 3. Content gap — no recent content
  const daysSinceLastContent = recentContent.length > 0
    ? Math.floor((Date.now() - new Date(recentContent[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 30

  if (daysSinceLastContent > 7) {
    opportunities.push({
      id: "content-gap",
      type: "content_idea",
      title: `${daysSinceLastContent} dias sem publicar conteudo`,
      description: "Publique pelo menos 1 artigo por semana para manter o trafego organico crescendo. Use o gerador de conteudo com IA.",
      impact: daysSinceLastContent > 14 ? "alto" : "medio",
      impactScore: Math.min(9, Math.floor(daysSinceLastContent / 3)),
      actionUrl: "/conteudo",
      category: "Conteudo",
      createdAt: new Date(),
    })
  }

  // 4. Health score quick wins
  if (healthScore) {
    const breakdown = (healthScore.breakdown as Record<string, { score: number; maxScore: number; label: string }>) || {}

    // SSL missing
    if (breakdown.ssl?.score === 0) {
      opportunities.push({
        id: "quick-win-ssl",
        type: "quick_win",
        title: "Ative SSL/HTTPS no seu site",
        description: "Seu site nao tem SSL. Ative em 5 minutos no seu provedor de hospedagem. Isso melhora SEO e seguranca.",
        impact: "alto",
        impactScore: 9,
        actionUrl: "/seo",
        category: "Seguranca",
        createdAt: new Date(),
      })
    }

    // Meta description missing
    if (breakdown.metaDescription?.score === 0) {
      opportunities.push({
        id: "quick-win-meta",
        type: "quick_win",
        title: "Adicione meta description ao seu site",
        description: "Meta descriptions melhoram o CTR nos resultados do Google. Leva 5 minutos para adicionar.",
        impact: "medio",
        impactScore: 7,
        actionUrl: "/seo",
        category: "SEO",
        createdAt: new Date(),
      })
    }

    // Low overall score
    if (healthScore.overallScore < 50) {
      opportunities.push({
        id: "low-score",
        type: "quick_win",
        title: "Seu Score Digital esta em ${healthScore.overallScore}/100",
        description: "Siga o plano de acao priorizado para subir rapidamente. Comece pelas Quick Wins.",
        impact: "alto",
        impactScore: 10,
        actionUrl: "/painel",
        category: "Geral",
        createdAt: new Date(),
      })
    }
  }

  // 5. Incomplete missions
  if (missions.length > 0 && missions.length <= 2) {
    opportunities.push({
      id: "missions-pending",
      type: "quick_win",
      title: `${missions.length} missao(oes) em andamento`,
      description: "Complete suas missoes semanais para ganhar XP e manter o progresso. Missoes expiram no domingo.",
      impact: "baixo",
      impactScore: 4,
      actionUrl: "/missoes",
      category: "Gamificacao",
      createdAt: new Date(),
    })
  }

  // 6. Budget optimization (if has ad accounts)
  const adAccounts = await db.adAccount.findMany({
    where: { userId, isActive: true, platform: { in: ["GOOGLE_ADS", "META_ADS"] } },
  })

  if (adAccounts.length > 0) {
    const snapshots = await db.adCampaignSnapshot.findMany({
      where: { adAccountId: { in: adAccounts.map((a) => a.id) } },
      orderBy: { snapshotAt: "desc" },
      take: 10,
    })

    const highCPA = snapshots.filter(
      (s) => s.spend > 0 && s.conversions > 0 && s.spend / s.conversions > 50
    )

    if (highCPA.length > 0) {
      opportunities.push({
        id: "budget-optimization",
        type: "budget_optimization",
        title: "Campanhas com CPA acima de R$50",
        description: `${highCPA.length} campanha(s) tem custo por aquisicao alto. Revise o publico-alvo e criativos.`,
        impact: "alto",
        impactScore: 8,
        actionUrl: "/anuncios",
        category: "Anuncios",
        createdAt: new Date(),
      })
    }
  }

  // Sort by impact score descending
  opportunities.sort((a, b) => b.impactScore - a.impactScore)

  return opportunities
}
