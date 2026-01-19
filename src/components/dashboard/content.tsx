'use client'

import { useState, useEffect } from 'react'

interface DashboardContentProps {
    children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        // Initialize from localStorage
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved !== null) {
            setIsCollapsed(saved === 'true')
        }

        // Listen for sidebar toggle events
        const handleToggle = (e: CustomEvent<{ collapsed: boolean }>) => {
            setIsCollapsed(e.detail.collapsed)
        }

        window.addEventListener('sidebar-toggle', handleToggle as EventListener)
        return () => window.removeEventListener('sidebar-toggle', handleToggle as EventListener)
    }, [])

    return (
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
            <div className="p-8">
                {children}
            </div>
        </main>
    )
}
