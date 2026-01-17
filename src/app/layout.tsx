import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "RedditLeadAI | Find High-Intent Leads on Reddit",
    description: "Monitor subreddits, identify potential customers asking for recommendations, and get AI-generated replies. Powered by Gemini 2.0 Flash.",
    keywords: ["reddit", "lead generation", "AI", "sales", "marketing", "SaaS"],
    authors: [{ name: "RedditLeadAI" }],
    openGraph: {
        title: "RedditLeadAI | Find High-Intent Leads on Reddit",
        description: "Monitor subreddits, identify potential customers asking for recommendations, and get AI-generated replies.",
        type: "website",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} antialiased`}>
                {children}
                <Toaster richColors position="top-right" />
                <SpeedInsights />
            </body>
        </html>
    )
}
