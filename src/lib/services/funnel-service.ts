import { db } from "@/lib/db"
import { checkFunnelLimit } from "@/lib/services/plan-limits"

export async function createFunnel(userId: string, data: { name: string; templateId?: string }) {
  const limit = await checkFunnelLimit(userId)
  if (!limit.allowed) {
    throw new Error(`Limite de funis atingido (${limit.limit}). Faca upgrade do seu plano.`)
  }

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const funnel = await db.funnel.create({
    data: {
      userId,
      name: data.name,
      slug: `${slug}-${Date.now().toString(36)}`,
      templateId: data.templateId,
    },
  })

  // Create default landing page
  await db.funnelPage.create({
    data: {
      funnelId: funnel.id,
      name: "Pagina Principal",
      slug: "index",
      order: 0,
      type: "landing",
      blocks: getDefaultBlocks("landing"),
    },
  })

  // Create default thank you page
  await db.funnelPage.create({
    data: {
      funnelId: funnel.id,
      name: "Obrigado",
      slug: "obrigado",
      order: 1,
      type: "thankyou",
      blocks: getDefaultBlocks("thankyou"),
    },
  })

  return funnel
}

export async function getUserFunnels(userId: string) {
  return db.funnel.findMany({
    where: { userId },
    include: { pages: { select: { id: true, name: true, type: true, order: true }, orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getFunnel(userId: string, funnelId: string) {
  return db.funnel.findFirst({
    where: { id: funnelId, userId },
    include: { pages: { orderBy: { order: "asc" } } },
  })
}

export async function updateFunnel(userId: string, funnelId: string, data: { name?: string; isPublished?: boolean }) {
  return db.funnel.update({
    where: { id: funnelId, userId },
    data,
  })
}

export async function deleteFunnel(userId: string, funnelId: string) {
  return db.funnel.delete({ where: { id: funnelId, userId } })
}

export async function updateFunnelPage(pageId: string, data: { name?: string; blocks?: unknown }) {
  const updateData: Record<string, unknown> = {}
  if (data.name) updateData.name = data.name
  if (data.blocks) updateData.blocks = JSON.parse(JSON.stringify(data.blocks))

  return db.funnelPage.update({ where: { id: pageId }, data: updateData })
}

export async function addFunnelPage(funnelId: string, data: { name: string; type: string }) {
  const lastPage = await db.funnelPage.findFirst({
    where: { funnelId },
    orderBy: { order: "desc" },
  })

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  return db.funnelPage.create({
    data: {
      funnelId,
      name: data.name,
      slug,
      order: (lastPage?.order || 0) + 1,
      type: data.type,
      blocks: getDefaultBlocks(data.type),
    },
  })
}

export async function deleteFunnelPage(pageId: string) {
  return db.funnelPage.delete({ where: { id: pageId } })
}

function getDefaultBlocks(type: string) {
  if (type === "landing") {
    return JSON.parse(JSON.stringify([
      { id: "hero", type: "hero", data: { title: "Titulo Principal", subtitle: "Subtitulo atrativo para seu visitante", ctaText: "Quero Saber Mais", ctaUrl: "#form" } },
      { id: "benefits", type: "features", data: { title: "Por que escolher?", items: [{ icon: "check", title: "Beneficio 1", description: "Descricao do beneficio" }, { icon: "check", title: "Beneficio 2", description: "Descricao do beneficio" }, { icon: "check", title: "Beneficio 3", description: "Descricao do beneficio" }] } },
      { id: "form", type: "form", data: { title: "Preencha seus dados", fields: [{ label: "Nome", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Telefone", type: "tel", required: false }], buttonText: "Enviar" } },
    ]))
  }

  if (type === "thankyou") {
    return JSON.parse(JSON.stringify([
      { id: "thanks", type: "hero", data: { title: "Obrigado!", subtitle: "Recebemos seus dados. Em breve entraremos em contato.", ctaText: "Voltar ao site", ctaUrl: "/" } },
    ]))
  }

  return JSON.parse(JSON.stringify([
    { id: "default", type: "text", data: { content: "Conteudo da pagina" } },
  ]))
}
