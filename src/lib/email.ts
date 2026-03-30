import { Resend } from "resend"

const FROM_EMAIL = "AdsUnify <noreply@adsunify.com>"

function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = getResendClient()
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email")
    return { success: false, error: "No API key" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("[Email] Send error:", error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error("[Email] Exception:", err)
    return { success: false, error: err }
  }
}

// Weekly report email template
export function buildWeeklyReportEmail({
  userName,
  overallScore,
  scoreChange,
  topKeywords,
  missionsCompleted,
  contentPublished,
  opportunities,
}: {
  userName: string
  overallScore: number
  scoreChange: number
  topKeywords: { keyword: string; position: number; change: number }[]
  missionsCompleted: number
  contentPublished: number
  opportunities: string[]
}) {
  const scoreColor = overallScore >= 80 ? "#22c55e" : overallScore >= 60 ? "#eab308" : overallScore >= 40 ? "#f97316" : "#ef4444"
  const changeIcon = scoreChange > 0 ? "↑" : scoreChange < 0 ? "↓" : "→"
  const changeColor = scoreChange > 0 ? "#22c55e" : scoreChange < 0 ? "#ef4444" : "#71717a"

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:8px 16px;border-radius:12px;margin-bottom:16px">
        <span style="color:white;font-weight:bold;font-size:18px">AdsUnify</span>
      </div>
      <h1 style="color:#1a1a2e;font-size:24px;margin:8px 0 4px">Relatorio Semanal</h1>
      <p style="color:#64748b;font-size:14px;margin:0">Ola ${userName}, aqui esta seu resumo da semana</p>
    </div>

    <!-- Score Card -->
    <div style="background:white;border-radius:16px;padding:24px;text-align:center;margin-bottom:16px;border:1px solid #e2e8f0">
      <p style="color:#64748b;font-size:13px;margin:0 0 8px">Score de Saude Digital</p>
      <div style="font-size:48px;font-weight:800;color:${scoreColor}">${overallScore}</div>
      <div style="color:${changeColor};font-size:14px;font-weight:600">${changeIcon} ${Math.abs(scoreChange)} pontos esta semana</div>
    </div>

    <!-- Stats Row -->
    <div style="display:flex;gap:12px;margin-bottom:16px">
      <div style="flex:1;background:white;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:700;color:#1a1a2e">${missionsCompleted}</div>
        <div style="font-size:12px;color:#64748b">Missoes</div>
      </div>
      <div style="flex:1;background:white;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:700;color:#1a1a2e">${contentPublished}</div>
        <div style="font-size:12px;color:#64748b">Conteudos</div>
      </div>
      <div style="flex:1;background:white;border-radius:12px;padding:16px;text-align:center;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:700;color:#1a1a2e">${topKeywords.length}</div>
        <div style="font-size:12px;color:#64748b">Keywords</div>
      </div>
    </div>

    <!-- Top Keywords -->
    ${topKeywords.length > 0 ? `
    <div style="background:white;border-radius:16px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0">
      <h3 style="color:#1a1a2e;font-size:14px;margin:0 0 12px">Top Keywords</h3>
      ${topKeywords.slice(0, 5).map(kw => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9">
          <span style="color:#334155;font-size:13px">${kw.keyword}</span>
          <span style="color:${kw.change > 0 ? '#22c55e' : kw.change < 0 ? '#ef4444' : '#64748b'};font-size:13px;font-weight:600">
            #${kw.position} ${kw.change !== 0 ? `(${kw.change > 0 ? '↑' : '↓'}${Math.abs(kw.change)})` : ''}
          </span>
        </div>
      `).join("")}
    </div>
    ` : ""}

    <!-- Opportunities -->
    ${opportunities.length > 0 ? `
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:20px;margin-bottom:16px;color:white">
      <h3 style="font-size:14px;margin:0 0 12px">Oportunidades da Semana</h3>
      ${opportunities.map(opp => `<p style="font-size:13px;margin:4px 0;opacity:0.9">• ${opp}</p>`).join("")}
    </div>
    ` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px">
      <a href="https://adsunify.com/painel" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px">
        Ver Dashboard Completo
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#94a3b8;font-size:11px">
      <p>AdsUnify — Seu Co-Piloto de Marketing Digital</p>
      <p>Voce recebe este email semanalmente. <a href="https://adsunify.com/configuracoes" style="color:#6366f1">Gerenciar preferencias</a></p>
    </div>
  </div>
</body>
</html>`
}

// Opportunity alert email
export function buildOpportunityAlertEmail({
  userName,
  opportunities,
}: {
  userName: string
  opportunities: { title: string; description: string; impact: string }[]
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:-apple-system,BlinkMacSystemFont,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:32px">🎯</span>
      <h2 style="color:#1a1a2e;margin:8px 0">${userName}, novas oportunidades detectadas!</h2>
    </div>
    ${opportunities.map(opp => `
    <div style="background:white;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #e2e8f0">
      <h3 style="color:#1a1a2e;font-size:14px;margin:0 0 4px">${opp.title}</h3>
      <p style="color:#64748b;font-size:13px;margin:0 0 8px">${opp.description}</p>
      <span style="background:#6366f1;color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">${opp.impact}</span>
    </div>
    `).join("")}
    <div style="text-align:center;margin-top:24px">
      <a href="https://adsunify.com/painel" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600">Ver no Dashboard</a>
    </div>
  </div>
</body>
</html>`
}
