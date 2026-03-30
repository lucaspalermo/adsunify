import { db } from "@/lib/db"
import { anthropic } from "@/lib/ai"

export async function createProposal(userId: string, data: {
  clientName: string
  clientEmail?: string
  title: string
  services?: unknown
  totalValue?: number
}) {
  return db.proposal.create({
    data: {
      userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      title: data.title,
      content: "",
      services: data.services ? JSON.parse(JSON.stringify(data.services)) : undefined,
      totalValue: data.totalValue,
    },
  })
}

export async function getUserProposals(userId: string) {
  return db.proposal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getProposal(userId: string, proposalId: string) {
  return db.proposal.findFirst({ where: { id: proposalId, userId } })
}

export async function updateProposal(userId: string, proposalId: string, data: { title?: string; content?: string; status?: string; services?: unknown; totalValue?: number }) {
  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.content !== undefined) updateData.content = data.content
  if (data.status !== undefined) updateData.status = data.status
  if (data.totalValue !== undefined) updateData.totalValue = data.totalValue
  if (data.services !== undefined) updateData.services = JSON.parse(JSON.stringify(data.services))

  return db.proposal.update({ where: { id: proposalId, userId }, data: updateData })
}

export async function deleteProposal(userId: string, proposalId: string) {
  return db.proposal.delete({ where: { id: proposalId, userId } })
}

// AI-generated proposal content
export async function generateProposalContent(data: {
  clientName: string
  businessType: string
  services: string[]
  budget: number
  goals: string
}) {
  const prompt = `Crie uma proposta comercial profissional de marketing digital para:

Cliente: ${data.clientName}
Tipo de negocio: ${data.businessType}
Servicos inclusos: ${data.services.join(", ")}
Orcamento mensal: R$${data.budget}
Objetivos: ${data.goals}

A proposta deve conter:
1. Saudacao personalizada
2. Diagnostico rapido do mercado do cliente
3. Estrategia proposta (detalhada por servico)
4. Cronograma de implementacao (primeiros 90 dias)
5. Investimento e condicoes
6. Resultados esperados
7. Proximos passos

Use linguagem profissional mas acessivel. Formate em markdown.`

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: "Voce eh um consultor de marketing digital brasileiro criando propostas comerciais. Escreva de forma profissional, persuasiva e personalizada.",
    messages: [{ role: "user", content: prompt }],
  })

  return stream
}
