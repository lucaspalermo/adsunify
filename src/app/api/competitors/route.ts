import { NextResponse } from "next/server"
import { addCompetitor, removeCompetitor, getCompetitors } from "@/lib/services/competitor-service"
import { db } from "@/lib/db"
import { anthropic } from "@/lib/ai"

async function resolveUserId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user) return user.id
  const fallback = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  return fallback?.id || null
}

// Fetch and analyze a competitor site with AI
async function analyzeCompetitorSite(domain: string, userSiteUrl: string) {
  // Try to fetch the site
  const urls = [`https://${domain}`, `https://www.${domain}`, `http://${domain}`]
  let html = ""
  let finalUrl = ""

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
      })
      if (res.ok) {
        html = await res.text()
        finalUrl = url
        break
      }
    } catch { /* try next */ }
  }

  if (!html) return null

  // Extract basic info
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || domain
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i)?.[1]?.trim() || ""
  const h1s = Array.from(html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 5)
  const h2s = Array.from(html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)).map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 10)

  // Use AI to analyze the competitor
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: "Responda APENAS com JSON valido. Sem crases, sem markdown.",
      messages: [{
        role: "user",
        content: `Analise este concorrente e me diga o que ele faz de BOM que eu posso copiar/melhorar.

CONCORRENTE: ${domain}
Titulo: ${title}
Meta Description: ${metaDesc}
H1s: ${h1s.join(", ")}
H2s: ${h2s.join(", ")}
MEU SITE: ${userSiteUrl}

Responda em JSON:
{
  "competitorName": "nome do concorrente",
  "whatTheySell": "o que vendem/oferecem",
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "keywordsTheyUse": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "estimatedTraffic": "baixo|medio|alto",
  "adStrategies": ["estrategia que provavelmente usam 1", "estrategia 2"],
  "whatToCopy": [
    {"action": "o que copiar/adaptar", "howTo": "como fazer no seu site", "priority": "alta|media"}
  ],
  "howToBeatThem": ["dica 1 para superar esse concorrente", "dica 2", "dica 3"]
}`
      }],
    })

    const aiText = response.content[0].type === "text" ? response.content[0].text : ""
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const realId = await resolveUserId(userId)
  if (!realId) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const competitors = await getCompetitors(realId)
  return NextResponse.json(competitors)
}

export async function POST(req: Request) {
  try {
    const { userId, name, domain, action, competitorId } = await req.json()

    const realId = await resolveUserId(userId || "demo")
    if (!realId) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (action === "remove" && competitorId) {
      await removeCompetitor(realId, competitorId)
      return NextResponse.json({ success: true })
    }

    // Accept either a full URL or just a name - extract domain
    const cleanDomain = (domain || name || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim().toLowerCase()

    if (!cleanDomain || !cleanDomain.includes(".")) {
      return NextResponse.json({ error: "Coloque o site do concorrente (ex: concorrente.com.br)" }, { status: 400 })
    }

    // Get user's site URL for comparison
    const user = await db.user.findUnique({ where: { id: realId }, select: { businessUrl: true } })

    const competitor = await addCompetitor(realId, name || cleanDomain, cleanDomain)

    // Analyze competitor with AI in background
    const analysis = await analyzeCompetitorSite(cleanDomain, user?.businessUrl || "")

    // Save analysis as snapshot
    if (analysis) {
      await db.competitorSnapshot.create({
        data: {
          competitorId: competitor.id,
          domainAuth: analysis.estimatedTraffic === "alto" ? 60 : analysis.estimatedTraffic === "medio" ? 35 : 15,
          organicKw: analysis.keywordsTheyUse?.length || 0,
          traffic: analysis.estimatedTraffic === "alto" ? 15000 : analysis.estimatedTraffic === "medio" ? 5000 : 1000,
          topKeywords: JSON.parse(JSON.stringify(analysis.keywordsTheyUse || [])),
          techStack: JSON.parse(JSON.stringify(analysis)),
        },
      })
    }

    // Track action
    try {
      const { trackAction } = await import("@/lib/services/action-tracker")
      await trackAction(realId, "analyze_competitor")
    } catch {}

    return NextResponse.json({ competitor, analysis })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
