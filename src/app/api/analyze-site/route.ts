import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { anthropic } from "@/lib/ai"

// Fetch site with www/non-www fallback
async function fetchSite(url: string): Promise<{ html: string; finalUrl: string; status: number; headers: Headers } | null> {
  const urls = [url]
  if (url.includes("://www.")) urls.push(url.replace("://www.", "://"))
  if (!url.includes("://www.")) urls.push(url.replace("://", "://www."))

  for (const tryUrl of urls) {
    try {
      const res = await fetch(tryUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "text/html" },
        signal: AbortSignal.timeout(15000),
        redirect: "follow",
      })
      if (res.ok) {
        return { html: await res.text(), finalUrl: tryUrl, status: res.status, headers: res.headers }
      }
    } catch { /* try next */ }
  }
  return null
}

// Extract key info from HTML
function extractSiteInfo(html: string, url: string) {
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || ""
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i)?.[1]?.trim() || ""
  const h1s = Array.from(html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean)
  const h2s = Array.from(html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)).map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 10)
  const isHttps = url.startsWith("https://")
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html)
  const hasOG = /<meta[^>]*property=["']og:/i.test(html)
  const imgCount = (html.match(/<img /gi) || []).length
  const imgNoAlt = imgCount - (html.match(/<img [^>]*alt=["'][^"']+["']/gi) || []).length
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html)
  const links = Array.from(html.matchAll(/href=["'](\/[^"']*|https?:\/\/[^"']*)/gi)).map(m => m[1]).slice(0, 20)

  return { title, metaDesc, h1s, h2s, isHttps, hasViewport, hasOG, imgCount, imgNoAlt, hasCanonical, links }
}

export async function POST(req: Request) {
  try {
    const { userId, url, objective, businessDescription } = await req.json()

    // Resolve user
    let user = await db.user.findUnique({ where: { id: userId } })
    if (!user) user = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const fullUrl = url.startsWith("http") ? url : `https://${url}`

    // Fetch and analyze site
    const siteData = await fetchSite(fullUrl)
    if (!siteData) {
      return NextResponse.json({ error: "Nao foi possivel acessar o site. Verifique a URL." }, { status: 400 })
    }

    const info = extractSiteInfo(siteData.html, siteData.finalUrl)

    // Build AI prompt with all the site data
    const prompt = `Analise este site e crie um plano de marketing digital COMPLETO e PERSONALIZADO.

URL: ${siteData.finalUrl}
Titulo: ${info.title}
Meta Description: ${info.metaDesc}
H1s: ${info.h1s.join(", ") || "NENHUM (problema!)"}
H2s: ${info.h2s.join(", ")}
HTTPS: ${info.isHttps ? "Sim" : "NAO (critico!)"}
Responsivo: ${info.hasViewport ? "Sim" : "NAO"}
Open Graph: ${info.hasOG ? "Sim" : "Nao"}
Imagens sem alt: ${info.imgNoAlt} de ${info.imgCount}
Canonical: ${info.hasCanonical ? "Sim" : "Nao"}
Objetivo do dono: ${objective || "Mais vendas"}
Descricao do negocio: ${businessDescription || "Nao informado"}

Voce eh o MELHOR GESTOR DE TRAFEGO do Brasil, com 15 anos de experiencia em Google Ads, Meta Ads e TikTok Ads. O cliente te contratou para criar campanhas profissionais PRONTAS PARA USAR.

RESPONDA EXATAMENTE no formato JSON abaixo (sem markdown, sem crases, apenas JSON puro):

{
  "siteType": "ecommerce|servicos|institucional|blog|outro",
  "niche": "nicho identificado",
  "mainProduct": "produto ou servico principal",
  "seoScore": 0-100,
  "seoIssues": [
    {"item": "nome", "status": "ok|warning|error", "detail": "descricao", "howToFix": "como corrigir"}
  ],
  "suggestedKeywords": [
    {"keyword": "palavra", "reason": "por que usar", "estimatedVolume": "alto|medio|baixo", "difficulty": "facil|medio|dificil", "matchType": "exata|frase|ampla", "intent": "compra|pesquisa"}
  ],
  "negativeKeywords": ["gratis", "como fazer", "tutorial", "etc"],
  "googleAds": {
    "recommendedDailyBudget": "R$XX",
    "recommendedMonthlyBudget": "R$XXX a R$XXX",
    "campaignType": "Rede de Pesquisa",
    "biddingStrategy": "Maximizar conversoes|CPA desejado|Maximizar cliques",
    "campaigns": [
      {
        "name": "nome da campanha",
        "objective": "Vendas|Leads|Trafego",
        "targetAudience": "descricao detalhada do publico ideal",
        "locations": "cidades/estados para segmentar",
        "schedule": "Seg-Sex 8h-20h",
        "devices": "Celular e Desktop|Apenas Celular",
        "estimatedCPC": "R$X,XX",
        "estimatedConversions": "X-Y conversoes/mes",
        "headlines": ["15 titulos de ate 30 chars cada"],
        "descriptions": ["4 descricoes de ate 90 chars cada"],
        "displayPath": ["caminho1", "caminho2"],
        "sitelinks": [
          {"title": "max 25 chars", "description1": "max 35 chars", "description2": "max 35 chars", "url": "/pagina"}
        ],
        "callouts": ["Frete Gratis", "Parcele em 12x", "etc"],
        "snippets": {"header": "Tipos|Marcas|Servicos", "values": ["v1", "v2", "v3", "v4"]},
        "structuredPhone": "se tiver telefone",
        "priceExtensions": [{"header": "Produto/Servico", "price": "R$XX", "url": "/pagina"}],
        "keywords": ["15+ palavras-chave para essa campanha"],
        "adGroups": [
          {"name": "nome do grupo", "keywords": ["palavras desse grupo"], "matchTypes": ["exata", "frase"]}
        ]
      }
    ]
  },
  "metaAds": {
    "recommendedDailyBudget": "R$XX",
    "recommendedMonthlyBudget": "R$XXX a R$XXX",
    "pixelTip": "instrucao de como instalar o Pixel do Meta no site",
    "campaigns": [
      {
        "name": "nome da campanha",
        "objective": "Vendas|Leads|Trafego|Mensagens",
        "optimizationGoal": "Compras|Leads|Cliques|Conversas",
        "targetAudience": {
          "age": "18-65|25-45|etc",
          "gender": "Todos|Feminino|Masculino",
          "interests": ["interesse1", "interesse2", "interesse3"],
          "behaviors": ["comportamento1", "comportamento2"],
          "locations": "cidades/estados",
          "customAudience": "instrucao de como criar publico personalizado se tiver lista de clientes"
        },
        "placements": "Advantage+ (automatico)|Feed Instagram|Stories|Reels|Facebook Feed",
        "budget": {"daily": "R$XX", "duration": "continuo|7 dias|14 dias|30 dias"},
        "creatives": [
          {
            "format": "Imagem Unica|Carrossel|Video|Stories",
            "primaryText": "texto principal completo do anuncio (pode ter ate 2200 chars, mas ideal 125 chars antes do 'ver mais'). Use emojis estrategicos.",
            "headline": "titulo de ate 40 chars",
            "description": "descricao de ate 30 chars",
            "callToAction": "Comprar Agora|Saiba Mais|Enviar Mensagem|Cadastre-se",
            "imageDirection": "descricao detalhada de como a imagem/video deve ser - cores, elementos, estilo",
            "carouselCards": [
              {"headline": "titulo card 1", "description": "desc", "imageDirection": "descricao da imagem"}
            ]
          }
        ],
        "abTestTip": "dica de teste A/B para essa campanha"
      }
    ],
    "retargeting": {
      "name": "Remarketing - Visitantes do Site",
      "description": "campanha para quem ja visitou o site mas nao comprou",
      "audience": "Visitantes dos ultimos 30 dias que nao converteram",
      "primaryText": "texto do anuncio de remarketing",
      "headline": "titulo remarketing",
      "tip": "como configurar o publico de remarketing no Meta"
    }
  },
  "tiktokAds": {
    "recommendedDailyBudget": "R$XX",
    "isRecommended": true,
    "whyTikTok": "por que esse negocio deveria anunciar no TikTok",
    "campaigns": [
      {
        "name": "nome da campanha",
        "objective": "Conversoes no Site|Trafego|Geração de Leads",
        "targetAudience": {
          "age": "18-34|25-44|etc",
          "gender": "Todos|Feminino|Masculino",
          "interests": ["interesse1", "interesse2"],
          "locations": "cidades/estados"
        },
        "creatives": [
          {
            "format": "Video In-Feed|Spark Ads|TopView",
            "videoScript": "roteiro COMPLETO do video de 15-30 segundos, cena por cena: CENA 1 (0-3s): gancho inicial - o que mostrar e falar. CENA 2 (3-10s): problema/solucao. CENA 3 (10-20s): produto/servico. CENA 4 (20-30s): CTA final",
            "hookIdeas": ["3 ideias de gancho para os primeiros 3 segundos"],
            "textOverlay": "texto que aparece sobre o video",
            "musicSuggestion": "tipo de musica/trending sound para usar",
            "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
            "caption": "legenda do post"
          }
        ],
        "tip": "dica profissional para TikTok Ads"
      }
    ]
  },
  "contentPlan": [
    {"type": "artigo|post_social", "title": "titulo", "description": "descricao", "targetKeyword": "keyword", "priority": "alta|media"}
  ],
  "quickWins": [
    {"action": "acao", "impact": "alto|medio", "timeToComplete": "X min", "howTo": "instrucoes"}
  ],
  "monthlyPlan": {
    "week1": "semana 1",
    "week2": "semana 2",
    "week3": "semana 3",
    "week4": "semana 4"
  },
  "competitorKeywords": ["palavras dos concorrentes"],
  "budgetDistribution": {
    "total": "R$XXX/mes",
    "google": "XX%",
    "meta": "XX%",
    "tiktok": "XX%",
    "explanation": "por que essa distribuicao"
  }
}

REGRAS ABSOLUTAS (nao pode faltar NADA):

GOOGLE ADS:
- 15 titulos DIFERENTES de ate 30 caracteres (use palavras-chave, beneficios, CTAs, numeros)
- 4 descricoes de ate 90 caracteres (com gatilhos mentais)
- 4 sitelinks com titulo + 2 descricoes + URL real do site
- 6+ callouts (destaques como Frete Gratis, Parcele em 12x)
- 1 snippet estruturado com 4+ valores
- Extensoes de preco se for e-commerce
- 2+ grupos de anuncio com palavras-chave agrupadas por tema
- 20+ palavras-chave com tipo de correspondencia
- 15+ palavras-chave negativas
- Display path (caminho de exibicao)
- Estrategia de lance recomendada

META ADS (Instagram/Facebook):
- 2+ campanhas (1 principal + 1 remarketing)
- Para cada campanha: publico DETALHADO (idade, genero, interesses especificos, comportamentos)
- 2+ criativos por campanha (formatos diferentes)
- Texto principal com emojis estrategicos e quebras de linha
- Direcao DETALHADA de como fazer a imagem/video (cores, elementos, estilo, o que mostrar)
- Se carrossel: descricao de cada card
- Dica de teste A/B
- Instrucao de como instalar Pixel

TIKTOK ADS:
- 1+ campanha com roteiro COMPLETO de video (cena por cena, segundo a segundo)
- 3 ideias de gancho para os 3 primeiros segundos
- Sugestao de musica/trending sound
- Hashtags relevantes
- Texto overlay
- Explicar por que TikTok eh bom para esse negocio

GERAL:
- Distribuicao de orcamento entre plataformas com justificativa
- Tudo 100% ESPECIFICO para esse negocio
- Use gatilhos mentais: urgencia, escassez, prova social, autoridade, reciprocidade
- Textos persuasivos como um copywriter profissional
- Se e-commerce: foque em palavras de compra e conversao
- Se servicos: foque em urgencia e localizacao`

    // Call Claude AI
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
      system: "Voce eh um gestor de trafego SENIOR de uma agencia de marketing digital top do Brasil, com 10+ anos de experiencia em Google Ads e Meta Ads. Responda APENAS com JSON valido, sem nenhum texto antes ou depois. Nao use crases ou markdown. Nao inclua comentarios no JSON.",
    })

    // Parse AI response
    const aiText = response.content[0].type === "text" ? response.content[0].text : ""
    let plan
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiText)
    } catch {
      console.error("Failed to parse AI response:", aiText.substring(0, 500))
      return NextResponse.json({ error: "Erro ao analisar resposta da IA" }, { status: 500 })
    }

    // Save plan to user
    await db.user.update({
      where: { id: user.id },
      data: {
        businessUrl: siteData.finalUrl,
        businessName: info.title || url,
        businessNiche: plan.niche || "Nao identificado",
        businessDescription: businessDescription || plan.mainProduct || "",
        marketingGoals: JSON.stringify([objective || "vendas"]),
        // Store the full plan in avatarConfig (reusing Json field)
        avatarConfig: JSON.parse(JSON.stringify(plan)),
      },
    })

    // Save health score from AI analysis
    await db.healthScore.create({
      data: {
        userId: user.id,
        overallScore: plan.seoScore || 50,
        seoScore: plan.seoScore || 50,
        adsScore: 0,
        contentScore: plan.contentPlan?.length > 0 ? 20 : 0,
        speedScore: 60,
        socialScore: info.hasOG ? 60 : 20,
      },
    })

    // Auto-add suggested keywords to tracking
    if (plan.suggestedKeywords?.length > 0) {
      for (const kw of plan.suggestedKeywords.slice(0, 5)) {
        try {
          await db.trackedKeyword.create({
            data: { userId: user.id, keyword: kw.keyword.toLowerCase() },
          })
        } catch { /* duplicate, skip */ }
      }
    }

    // Generate missions
    try {
      const { generateWeeklyMissions } = await import("@/lib/services/mission-engine")
      await generateWeeklyMissions(user.id)
    } catch {}

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "welcome",
        title: "Seu plano de marketing esta pronto!",
        body: `Analisamos ${siteData.finalUrl} e criamos um plano personalizado com ${plan.suggestedKeywords?.length || 0} palavras-chave e ${plan.contentPlan?.length || 0} conteudos sugeridos.`,
        actionUrl: "/painel",
      },
    })

    return NextResponse.json({
      success: true,
      plan,
      siteInfo: info,
      seoScore: plan.seoScore,
    })
  } catch (error) {
    console.error("Analyze error:", error)
    return NextResponse.json({ error: "Erro ao analisar site" }, { status: 500 })
  }
}
