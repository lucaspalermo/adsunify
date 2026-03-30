import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Entre na sua conta AdsUnify e continue dominando o marketing digital.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
