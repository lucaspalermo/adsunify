"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  Eye,
  Plus,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

const reports: {
  title: string
  date: string
  id: number
}[] = []

export default function RelatoriosPage() {
  const [previewId, setPreviewId] = useState<number>(1)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            <GradientText as="span">Relatórios</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Relatórios automáticos para acompanhar seu progresso
          </p>
        </div>
        <GlowButton>
          <Plus className="h-4 w-4" />
          Gerar Novo Relatório
        </GlowButton>
      </motion.div>

      {/* Reports List / Empty State */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        {reports.length === 0 ? (
          <GlassCard className="p-6" hover={false}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                <FileText className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900/80 mb-2">
                Nenhum relatorio gerado ainda
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Complete o Passo 1 do seu plano para gerar seu primeiro relatorio. Relatorios sao gerados automaticamente a cada mes com base nos seus dados.
              </p>
            </motion.div>
          </GlassCard>
        ) : (
          <>
            <GlassCard className="divide-y divide-slate-200 p-2" hover={false}>
              {reports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{report.title}</p>
                      <p className="text-xs text-slate-500">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlowButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewId(report.id)}
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </GlowButton>
                    <GlowButton size="sm" variant="secondary">
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </GlowButton>
                  </div>
                </motion.div>
              ))}
            </GlassCard>
          </>
        )}
      </motion.div>
    </div>
  )
}
