import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { GamificationProvider } from "@/components/providers/gamification-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AdsUnify - Seu Co-Piloto de Marketing Digital com IA",
    template: "%s | AdsUnify",
  },
  description: "Domine o marketing digital sem precisar de agencia. Co-piloto IA, missoes gamificadas, SEO inteligente e fabrica de conteudo. Comece gratis.",
  keywords: ["marketing digital", "SEO", "trafego pago", "co-piloto IA", "conteudo digital", "Google Ads", "Meta Ads", "AdsUnify"],
  authors: [{ name: "AdsUnify" }],
  creator: "AdsUnify",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://adsunify.com",
    siteName: "AdsUnify",
    title: "AdsUnify - Seu Co-Piloto de Marketing Digital com IA",
    description: "Domine o marketing digital sem precisar de agencia. Co-piloto IA, missoes gamificadas, SEO inteligente.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AdsUnify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdsUnify - Seu Co-Piloto de Marketing Digital com IA",
    description: "Domine o marketing digital sem precisar de agencia.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#09090B] text-zinc-50`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <GamificationProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
