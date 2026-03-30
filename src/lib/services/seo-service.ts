import { db } from "@/lib/db"

// Add a keyword to track
export async function addTrackedKeyword(userId: string, keyword: string, location = "BR") {
  return db.trackedKeyword.upsert({
    where: { userId_keyword_location: { userId, keyword: keyword.toLowerCase().trim(), location } },
    update: {},
    create: { userId, keyword: keyword.toLowerCase().trim(), location },
  })
}

// Remove a tracked keyword
export async function removeTrackedKeyword(userId: string, keywordId: string) {
  return db.trackedKeyword.delete({ where: { id: keywordId, userId } })
}

// Get all tracked keywords with latest ranking
export async function getTrackedKeywords(userId: string) {
  const keywords = await db.trackedKeyword.findMany({
    where: { userId },
    include: {
      rankings: {
        orderBy: { checkedAt: "desc" },
        take: 2, // current and previous for change calculation
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return keywords.map(kw => {
    const current = kw.rankings[0]
    const previous = kw.rankings[1]
    const change = current?.position && previous?.position
      ? previous.position - current.position  // positive = improved
      : 0

    return {
      id: kw.id,
      keyword: kw.keyword,
      location: kw.location,
      position: current?.position || null,
      previousPosition: previous?.position || null,
      change,
      volume: current?.volume || null,
      difficulty: current?.difficulty || null,
      lastChecked: current?.checkedAt || null,
      createdAt: kw.createdAt,
    }
  })
}

// Get keyword ranking history (for charts)
export async function getKeywordHistory(keywordId: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  return db.keywordRanking.findMany({
    where: { keywordId, checkedAt: { gte: since } },
    orderBy: { checkedAt: "asc" },
    select: { position: true, checkedAt: true },
  })
}

// Save a ranking check result (called by cron or manual check)
export async function saveKeywordRanking(keywordId: string, data: {
  position: number | null
  url?: string
  volume?: number
  difficulty?: number
}) {
  return db.keywordRanking.create({
    data: {
      keywordId,
      position: data.position,
      url: data.url,
      volume: data.volume,
      difficulty: data.difficulty,
    },
  })
}

// Try to fetch a URL, with fallback to alternative URLs
async function fetchWithFallback(url: string): Promise<Response> {
  const fetchOptions = {
    method: "GET" as const,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
    redirect: "follow" as const,
  }

  // Build list of URLs to try
  const urls: string[] = [url]

  // If has www, also try without
  if (url.includes("://www.")) {
    urls.push(url.replace("://www.", "://"))
  }
  // If no www, also try with
  if (!url.includes("://www.")) {
    urls.push(url.replace("://", "://www."))
  }

  let lastError: Error | null = null
  for (const tryUrl of urls) {
    try {
      const response = await fetch(tryUrl, fetchOptions)
      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }
  throw lastError || new Error("Nao foi possivel acessar o site")
}

// Simple site audit (basic checks without external API)
export async function runBasicSiteAudit(userId: string, url: string) {
  const issues: Array<{ type: string; severity: string; title: string; description: string }> = []

  try {
    // Check if site is accessible (tries with and without www)
    const response = await fetchWithFallback(url)

    const headers = response.headers
    const html = await response.text()

    // Check SSL
    const isHttps = url.startsWith("https://")
    if (!isHttps) {
      issues.push({ type: "security", severity: "high", title: "Site sem HTTPS", description: "Seu site nao usa HTTPS. Isso prejudica o SEO e a seguranca dos visitantes." })
    } else {
      issues.push({ type: "security", severity: "ok", title: "HTTPS ativo", description: "Seu site usa HTTPS. Otimo para seguranca e SEO!" })
    }

    // Check response code
    if (!response.ok) {
      issues.push({ type: "accessibility", severity: "critical", title: `Erro ${response.status}`, description: `Seu site retornou o codigo ${response.status}.` })
    }

    // Check title tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    if (titleMatch && titleMatch[1].trim()) {
      const title = titleMatch[1].trim()
      if (title.length < 30) {
        issues.push({ type: "seo", severity: "medium", title: "Title tag muito curto", description: `Seu titulo "${title}" tem ${title.length} caracteres. O ideal eh entre 50-60 caracteres.` })
      } else if (title.length > 65) {
        issues.push({ type: "seo", severity: "low", title: "Title tag muito longo", description: `Seu titulo tem ${title.length} caracteres. O Google corta apos 60 caracteres.` })
      } else {
        issues.push({ type: "seo", severity: "ok", title: "Title tag presente", description: `"${title}" — tamanho adequado (${title.length} caracteres).` })
      }
    } else {
      issues.push({ type: "seo", severity: "high", title: "Title tag ausente", description: "Seu site nao tem titulo (tag <title>). Isso eh essencial para o Google." })
    }

    // Check meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i)
    if (metaDescMatch && metaDescMatch[1].trim()) {
      const desc = metaDescMatch[1].trim()
      if (desc.length < 120) {
        issues.push({ type: "seo", severity: "medium", title: "Meta description curta", description: `Sua descricao tem ${desc.length} caracteres. O ideal eh entre 140-160.` })
      } else {
        issues.push({ type: "seo", severity: "ok", title: "Meta description presente", description: `Descricao com ${desc.length} caracteres — bom tamanho!` })
      }
    } else {
      issues.push({ type: "seo", severity: "high", title: "Meta description ausente", description: "Seu site nao tem meta description. Essa eh a descricao que aparece no Google abaixo do titulo." })
    }

    // Check H1
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
    if (h1Match) {
      issues.push({ type: "seo", severity: "ok", title: "H1 presente", description: "Seu site tem um titulo principal (H1). Otimo!" })
    } else {
      issues.push({ type: "seo", severity: "medium", title: "H1 ausente", description: "Seu site nao tem um titulo principal (tag H1). O Google usa isso para entender do que se trata a pagina." })
    }

    // Check images without alt
    const imgCount = (html.match(/<img /gi) || []).length
    const imgAltCount = (html.match(/<img [^>]*alt=["'][^"']+["']/gi) || []).length
    const imgNoAlt = imgCount - imgAltCount
    if (imgNoAlt > 0) {
      issues.push({ type: "seo", severity: "medium", title: `${imgNoAlt} imagens sem texto alternativo`, description: `De ${imgCount} imagens, ${imgNoAlt} nao tem atributo alt. Isso prejudica acessibilidade e SEO.` })
    } else if (imgCount > 0) {
      issues.push({ type: "seo", severity: "ok", title: "Imagens com alt text", description: `Todas as ${imgCount} imagens tem texto alternativo. Otimo!` })
    }

    // Check viewport meta
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html)
    if (hasViewport) {
      issues.push({ type: "seo", severity: "ok", title: "Site responsivo (viewport)", description: "Seu site tem a tag viewport configurada para celulares." })
    } else {
      issues.push({ type: "seo", severity: "high", title: "Nao responsivo (sem viewport)", description: "Seu site nao tem viewport meta tag. Pode nao funcionar bem em celulares." })
    }

    // Check canonical
    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html)
    if (!hasCanonical) {
      issues.push({ type: "seo", severity: "low", title: "Canonical URL ausente", description: "Recomendamos adicionar uma tag canonical para evitar conteudo duplicado no Google." })
    }

    // Check Open Graph
    const hasOG = /<meta[^>]*property=["']og:/i.test(html)
    if (hasOG) {
      issues.push({ type: "social", severity: "ok", title: "Open Graph configurado", description: "Seu site mostra preview bonito quando compartilhado no Facebook/WhatsApp." })
    } else {
      issues.push({ type: "social", severity: "medium", title: "Open Graph ausente", description: "Sem Open Graph, seu site nao mostra preview quando compartilhado nas redes sociais." })
    }

    // Check security headers
    if (headers.get("strict-transport-security")) {
      issues.push({ type: "security", severity: "ok", title: "HSTS ativo", description: "Seu site forca conexao segura. Otimo!" })
    }

    // Calculate score
    let score = 100
    const realIssues = issues.filter(i => i.severity !== "ok")
    for (const issue of realIssues) {
      if (issue.severity === "critical") score -= 25
      else if (issue.severity === "high") score -= 15
      else if (issue.severity === "medium") score -= 8
      else if (issue.severity === "low") score -= 3
    }
    score = Math.max(0, Math.min(100, score))

    const audit = await db.siteAudit.create({
      data: {
        userId,
        url,
        score,
        issues: JSON.parse(JSON.stringify(issues)),
        performance: { statusCode: response.status, isHttps, totalIssues: realIssues.length, okItems: issues.filter(i => i.severity === "ok").length },
        seo: { issueCount: realIssues.length, criticalCount: realIssues.filter(i => i.severity === "critical").length },
      },
    })

    return { audit, issues, score }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    issues.push({
      type: "accessibility",
      severity: "critical",
      title: "Site inacessivel",
      description: `Nao foi possivel acessar o site: ${errorMessage}`,
    })

    const audit = await db.siteAudit.create({
      data: {
        userId,
        url,
        score: 0,
        issues: JSON.parse(JSON.stringify(issues)),
        performance: { error: errorMessage },
        seo: { issueCount: 1, criticalCount: 1 },
      },
    })

    return { audit, issues, score: 0 }
  }
}

// Get latest audit
export async function getLatestAudit(userId: string) {
  return db.siteAudit.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

// Get SEO overview stats
export async function getSeoOverview(userId: string) {
  const keywords = await db.trackedKeyword.findMany({
    where: { userId },
    include: { rankings: { orderBy: { checkedAt: "desc" }, take: 1 } },
  })

  const totalKeywords = keywords.length
  const inTop10 = keywords.filter(kw => kw.rankings[0]?.position && kw.rankings[0].position <= 10).length
  const inTop3 = keywords.filter(kw => kw.rankings[0]?.position && kw.rankings[0].position <= 3).length
  const avgPosition = keywords.reduce((sum, kw) => sum + (kw.rankings[0]?.position || 100), 0) / (totalKeywords || 1)

  const latestAudit = await getLatestAudit(userId)

  return {
    totalKeywords,
    inTop10,
    inTop3,
    avgPosition: Math.round(avgPosition * 10) / 10,
    auditScore: latestAudit?.score || null,
    lastAuditDate: latestAudit?.createdAt || null,
  }
}
