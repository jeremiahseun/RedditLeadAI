'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Inbox, Settings, Target, CreditCard, LogOut, ChevronUp, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

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
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Load collapsed state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved !== null) {
            setIsCollapsed(saved === 'true')
        }
    }, [])

    const toggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem('sidebar-collapsed', String(newState))
        // Dispatch event so layout can react
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newState } }))
    }

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
        <aside className={`fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0" />
                    {!isCollapsed && <span className="text-lg font-bold text-white">RedditLeadAI</span>}
                </Link>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

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
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && item.label}
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
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${getPlanBadgeColor(user.subscription)}`}>
                                        {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                                    </span>
                                </div>
                                <ChevronUp className={`w-4 h-4 text-slate-500 transition-transform ${isMenuOpen ? '' : 'rotate-180'}`} />
                            </>
                        )}
                    </button>

                    {isMenuOpen && (
                        <div className={`absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl ${isCollapsed ? 'w-48 left-full ml-2' : 'w-full'}`}>
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
