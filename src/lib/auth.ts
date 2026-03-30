import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

// Only include Google provider if credentials are configured
const providers: NextAuthOptions["providers"] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

providers.push(
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) {
          throw new Error("Email ou senha incorretos")
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error("Email ou senha incorretos")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            plan: true,
            level: true,
            xp: true,
            levelTitle: true,
            businessName: true,
            businessNiche: true,
          },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.plan = dbUser.plan
          token.level = dbUser.level
          token.xp = dbUser.xp
          token.levelTitle = dbUser.levelTitle
          token.businessName = dbUser.businessName
          token.businessNiche = dbUser.businessNiche
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.plan = token.plan
        session.user.level = token.level
        session.user.xp = token.xp
        session.user.levelTitle = token.levelTitle
        session.user.businessName = token.businessName
        session.user.businessNiche = token.businessNiche
      }
      return session
    },
  },
}
