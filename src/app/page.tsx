'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Target, Clock, Shield, Star, Check, TrendingUp, Users, Eye, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const ROTATING_WORDS = ['Across the Web', 'Before Competitors', 'With AI Precision', 'While You Sleep']

function TypewriterText() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const word = ROTATING_WORDS[currentIndex]
        const speed = isDeleting ? 50 : 100

        if (!isDeleting && displayText === word) {
            setTimeout(() => setIsDeleting(true), 2000)
            return
        }

        if (isDeleting && displayText === '') {
            setIsDeleting(false)
            setCurrentIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
            return
        }

        const timeout = setTimeout(() => {
            setDisplayText(
                isDeleting
                    ? word.substring(0, displayText.length - 1)
                    : word.substring(0, displayText.length + 1)
            )
        }, speed)

        return () => clearTimeout(timeout)
    }, [displayText, isDeleting, currentIndex])

    return (
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    )
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-animate">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Rader Logo" className="w-8 h-8 rounded-lg" />
                            <span className="text-xl font-bold text-white">Rader</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</a>
                            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</a>
                            <a href="#compare" className="text-slate-400 hover:text-white transition-colors text-sm">Compare</a>
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
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all hover-lift glow-subtle"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Emotional Hook */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Floating orbs background */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    {/* Urgency badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span className="text-sm text-orange-300 font-medium">🚀 Launch Price — Limited Time Only</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Stop Watching Competitors
                        <br />
                        <span className="text-slate-400">Steal Their Customers</span>
                        <br />
                        <TypewriterText />
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4">
                        <span className="text-red-400 font-medium">Tired of manually searching?</span> Your competitors are already using AI to
                        find and respond to leads <span className="text-white">before you even see them</span>.
                    </p>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10">
                        Rader monitors social platforms 24/7, finds high-intent buyers, and writes authentic replies — so you can focus on closing deals, not hunting leads.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <Link
                            href="/login"
                            className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 hover-lift glow"
                        >
                            Start Your 3-Day Free Trial
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <p className="text-slate-500 text-sm">No credit card required · Cancel anytime</p>

                    {/* Pain point callout */}
                    <div className="mt-12 glass-card p-6 max-w-2xl mx-auto text-left">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium mb-1">The Problem Every Founder Faces</p>
                                <p className="text-slate-400 text-sm">
                                    There are people on Reddit <span className="text-white">right now</span> asking for a tool like yours.
                                    But by the time you find them manually, a competitor has already replied. You're leaving money on the table every single day.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Social proof */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span>100+ Founders Trust Us</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span>$50k+ Revenue Generated</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-pink-400" />
                            <span>50+ Subreddits Tracked</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Finally, Lead Gen That Actually Works
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            No more cold emails. No more expensive ads. Just real conversations with people who <em>already</em> want what you're selling.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Target className="w-6 h-6" />}
                            title="Keyword Tracking"
                            description="Set keywords for your product. We'll monitor multiple subreddits and alert you when someone mentions them."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6" />}
                            title="AI Lead Scoring"
                            description="AI analyzes each post and scores leads 0-100 based on purchase intent. Focus only on the hottest leads."
                        />
                        <FeatureCard
                            icon={<Clock className="w-6 h-6" />}
                            title="Real-time Updates"
                            description="New posts are checked every 15 minutes. Be the first to reply, not the fifth."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6" />}
                            title="Non-Spammy Replies"
                            description="AI generates helpful, authentic replies. Build trust, not resentment."
                        />
                        <FeatureCard
                            icon={<Star className="w-6 h-6" />}
                            title="Inbox-Style Dashboard"
                            description="Clean interface to review leads, copy replies, and open posts on Reddit."
                        />
                        <FeatureCard
                            icon={<Eye className="w-6 h-6" />}
                            title="Competitor Watch"
                            description="Know when competitors get mentioned. Swoop in and win customers from under them."
                            badge="New"
                        />
                    </div>
                </div>
            </section>

            {/* Founder Story Section */}
            <section className="py-20 px-4 bg-slate-900/30">
                <div className="max-w-3xl mx-auto">
                    <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    J
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Jeremiah</p>
                                    <p className="text-slate-400 text-sm">Founder, Rader</p>
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                "I built this because I suck at selling."
                            </h2>

                            <div className="space-y-4 text-slate-300 leading-relaxed">
                                <p>
                                    Let me be real with you — <span className="text-white font-medium">I'm shy</span>. The thought of cold DMing strangers or writing "salesy" posts makes me cringe. I'd rather just build stuff.
                                </p>
                                <p>
                                    But here's the problem: I kept launching products and <span className="text-red-400">forgetting to tell anyone about them</span>. I'd see competitors with worse products getting traction just because they were better at self-promotion.
                                </p>
                                <p>
                                    One day I realized: <span className="text-purple-400 font-medium">people on Reddit are literally asking for tools like mine</span>. They're begging for solutions. I just needed to show up and help them.
                                </p>
                                <p>
                                    So I built Rader for myself. To find those conversations automatically. To get AI-written replies that don't sound desperate. To build karma and look legit without spending hours scrolling.
                                </p>
                                <p className="text-white font-medium">
                                    If you're an introvert who'd rather code than sell — this is for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section id="compare" className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Stop Overpaying for Lead Gen
                        </h2>
                        <p className="text-slate-400">
                            Other tools charge $19-79/month. We believe indie hackers deserve better.
                        </p>
                    </div>

                    <div className="glass-card p-8 overflow-hidden">
                        <div className="grid grid-cols-3 gap-4 text-center mb-6">
                            <div></div>
                            <div className="text-slate-400 font-medium">Competitors</div>
                            <div className="text-purple-400 font-bold">Rader</div>
                        </div>
                        <ComparisonRow label="Starting Price" competitor="$19/mo" us="$5/mo 🔥" highlight />
                        <ComparisonRow label="Keyword Tracking" competitor="✓" us="✓" />
                        <ComparisonRow label="AI Replies" competitor="✓" us="✓" />
                        <ComparisonRow label="Competitor Monitoring" competitor="Paid add-on" us="Included" highlight />
                        <ComparisonRow label="Free Trial" competitor="Credit Card Required" us="3 Days Free" highlight />
                        <ComparisonRow label="Setup Time" competitor="30+ minutes" us="< 2 minutes" highlight />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
                            <span className="text-sm text-green-300 font-medium">🎉 Launch Special — Save 50%+</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Pricing That Actually Makes Sense
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            We know what it's like to bootstrap. That's why we kept it stupid simple.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            name="Starter"
                            price="Free"
                            description="Test the waters. No strings attached."
                            features={[
                                '1 Subreddit',
                                '2 Keywords',
                                '5 Leads/month',
                                'AI-generated replies',
                            ]}
                            cta="Get Started Free"
                            href="/login"
                        />
                        <PricingCard
                            name="Founder"
                            price="$5"
                            period="/month"
                            originalPrice="$12"
                            description="Built for solo founders who hustle."
                            features={[
                                '10 Subreddits',
                                'Unlimited Keywords',
                                'Unlimited Leads',
                                'Track 3 Competitors',
                                'Priority support',
                            ]}
                            cta="Start 3-Day Free Trial"
                            href="/login"
                            popular
                            launchPrice
                        />
                        <PricingCard
                            name="Agency"
                            price="$12"
                            period="/month"
                            originalPrice="$39"
                            description="Scale your outreach across clients."
                            features={[
                                '50 Subreddits',
                                'Unlimited Keywords',
                                'Unlimited Leads',
                                'Track 10 Competitors',
                                'Dedicated support',
                                'Custom integrations',
                            ]}
                            cta="Start 3-Day Free Trial"
                            href="/login"
                            launchPrice
                        />
                    </div>

                    <p className="text-center text-slate-500 text-sm mt-8">
                        * Launch pricing locks in forever. Upgrade or cancel anytime.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Your Competitors Won't Wait
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                Every day you wait is another day of leads going to someone else. Start finding customers on Reddit in the next 2 minutes.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover-lift glow"
                            >
                                Claim Your 3-Day Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <p className="text-slate-500 text-sm mt-4">No credit card. No BS. Just leads.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Rader Logo" className="w-6 h-6 rounded-md" />
                        <span className="text-white font-semibold">Rader</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Rader. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
    badge
}: {
    icon: React.ReactNode
    title: string
    description: string
    badge?: string
}) {
    return (
        <div className="glass-card p-6 hover:border-purple-500/30 hover-lift relative">
            {badge && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    )
}

function ComparisonRow({
    label,
    competitor,
    us,
    highlight
}: {
    label: string
    competitor: string
    us: string
    highlight?: boolean
}) {
    return (
        <div className={`grid grid-cols-3 gap-4 py-4 border-b border-slate-700/50 text-center ${highlight ? 'bg-purple-500/5' : ''}`}>
            <div className="text-left text-slate-300">{label}</div>
            <div className="text-slate-500">{competitor}</div>
            <div className={highlight ? 'text-green-400 font-medium' : 'text-white'}>{us}</div>
        </div>
    )
}

function PricingCard({
    name,
    price,
    period,
    originalPrice,
    description,
    features,
    cta,
    href,
    popular,
    launchPrice
}: {
    name: string
    price: string
    period?: string
    originalPrice?: string
    description: string
    features: string[]
    cta: string
    href: string
    popular?: boolean
    launchPrice?: boolean
}) {
    return (
        <div className={`relative glass-card p-8 hover-lift ${popular ? 'border-purple-500 ring-2 ring-purple-500/20' : ''
            }`}>
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                </div>
            )}
            {launchPrice && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Launch Price
                </div>
            )}
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <div className="mt-4 mb-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{price}</span>
                {period && <span className="text-slate-400">{period}</span>}
                {originalPrice && (
                    <span className="text-slate-500 line-through text-lg">{originalPrice}</span>
                )}
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
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white glow-subtle'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
            >
                {cta}
            </Link>
        </div>
    )
}
