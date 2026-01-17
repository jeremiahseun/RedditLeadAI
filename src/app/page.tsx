import Link from 'next/link'
import { ArrowRight, Zap, Target, Clock, Shield, Star, Check } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
                            <span className="text-xl font-bold text-white">RedditLeadAI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">Powered by AI</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Find High-Intent Leads
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            on Reddit
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Monitor subreddits, identify potential customers asking for recommendations,
                        and get AI-generated replies. No more scrolling — let AI find your leads.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-slate-500 text-sm">No credit card required · 5 free leads</p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
                        Everything you need to find leads on Reddit
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Target className="w-6 h-6" />}
                            title="Keyword Tracking"
                            description="Set keywords for your product. We'll monitor multiple subreddits and alert you when someone mentions them."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6" />}
                            title="AI Lead Scoring"
                            description="AI analyzes each post and scores leads 0-100 based on purchase intent."
                        />
                        <FeatureCard
                            icon={<Clock className="w-6 h-6" />}
                            title="Real-time Updates"
                            description="New posts are checked every 15 minutes. Never miss a potential customer again."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6" />}
                            title="Non-Spammy Replies"
                            description="AI generates helpful, authentic replies. No robotic sales pitches."
                        />
                        <FeatureCard
                            icon={<Star className="w-6 h-6" />}
                            title="Inbox-Style Dashboard"
                            description="Clean interface to review leads, copy replies, and open posts on Reddit."
                        />
                        <FeatureCard
                            icon={<ArrowRight className="w-6 h-6" />}
                            title="One-Click Actions"
                            description="Copy the AI reply and open Reddit in one click. Post manually to stay authentic."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
                        Start free and upgrade as you grow. No hidden fees.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            name="Starter"
                            price="Free"
                            description="Get started with Reddit lead generation"
                            features={[
                                '1 Subreddit',
                                '2 Keywords',
                                '5 Leads/month',
                                'AI-generated replies',
                            ]}
                            cta="Get Started"
                            href="/login"
                        />
                        <PricingCard
                            name="Founder"
                            price="$12"
                            period="/month"
                            description="For indie hackers and solo founders"
                            features={[
                                '10 Subreddits',
                                'Unlimited Keywords',
                                'Unlimited Leads',
                                'Track 3 Competitors',
                                'Priority support',
                            ]}
                            cta="Start Trial"
                            href="/login"
                            popular
                        />
                        <PricingCard
                            name="Agency"
                            price="$39"
                            period="/month"
                            description="For agencies and marketing teams"
                            features={[
                                '50 Subreddits',
                                'Unlimited Keywords',
                                'Unlimited Leads',
                                'Track 10 Competitors',
                                'Dedicated support',
                                'Custom integrations',
                            ]}
                            cta="Start Trial"
                            href="/login"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md" />
                        <span className="text-white font-semibold">RedditLeadAI</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} RedditLeadAI. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    )
}

function PricingCard({
    name,
    price,
    period,
    description,
    features,
    cta,
    href,
    popular
}: {
    name: string
    price: string
    period?: string
    description: string
    features: string[]
    cta: string
    href: string
    popular?: boolean
}) {
    return (
        <div className={`relative bg-slate-800/30 backdrop-blur border rounded-2xl p-8 ${popular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-700/50'
            }`}>
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                </div>
            )}
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-white">{price}</span>
                {period && <span className="text-slate-400">{period}</span>}
            </div>
            <p className="text-slate-400 text-sm mb-6">{description}</p>
            <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>
            <Link
                href={href}
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
            >
                {cta}
            </Link>
        </div>
    )
}
