import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Precos e Planos",
  description: "Escolha o plano ideal para seu negocio. A partir de R$67/mes. 7 dias gratis, sem cartao de credito.",
}

export default function PrecosLayout({ children }: { children: React.ReactNode }) {
  return children
}
