'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Inbox, Settings, Target, CreditCard, LogOut, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface DashboardSidebarProps {
    user: {
        email: string
        name: string
        subscription: 'free' | 'founder' | 'agency'
    }
}

const navItems = [
    { href: '/dashboard', label: 'Leads', icon: Inbox },
    { href: '/dashboard/trackers', label: 'Trackers', icon: Target },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'founder':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'agency':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
                    <span className="text-lg font-bold text-white">RedditLeadAI</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t border-slate-800">
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${getPlanBadgeColor(user.subscription)}`}>
                                {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                            </span>
                        </div>
                        <ChevronUp className={`w-4 h-4 text-slate-500 transition-transform ${isMenuOpen ? '' : 'rotate-180'}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
