import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Rader | Internet Lead Detector",
    description: "Stop Watching using Rader. Start Detecting. Monitor social platforms, identify high-intent leads, and get AI-generated replies.",
    keywords: ["reddit", "lead generation", "AI", "sales", "marketing", "SaaS", "social listening"],
    authors: [{ name: "Rader" }],
    openGraph: {
        title: "Rader | Internet Lead Detector",
        description: "Stop Watching using Rader. Start Detecting. Monitor social platforms, identify high-intent leads, and get AI-generated replies.",
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
