import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      plan: string
      level: number
      xp: number
      levelTitle: string
      businessName: string | null
      businessNiche: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    plan: string
    level: number
    xp: number
    levelTitle: string
    businessName: string | null
    businessNiche: string | null
  }
}
