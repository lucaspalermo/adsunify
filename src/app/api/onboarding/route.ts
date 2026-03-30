import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const onboardingSchema = z.object({
  userId: z.string(),
  businessName: z.string().min(1),
  businessUrl: z.string().optional(),
  businessDescription: z.string().optional(),
  businessNiche: z.string().min(1),
  marketingGoals: z.array(z.string()),
  monthlyBudget: z.number().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = onboardingSchema.parse(body)

    await db.user.update({
      where: { id: data.userId },
      data: {
        businessName: data.businessName,
        businessUrl: data.businessUrl,
        businessDescription: data.businessDescription,
        businessNiche: data.businessNiche,
        marketingGoals: data.marketingGoals,
        monthlyBudget: data.monthlyBudget,
      },
    })

    return NextResponse.json({ message: "Onboarding completo!" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
