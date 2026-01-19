import { ProfileRepository } from '@/lib/supabase'
import { AuthService } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardContent } from '@/components/dashboard/content'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await AuthService.getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const profile = await ProfileRepository.getById(user.id)

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <DashboardSidebar
                user={{
                    email: user.email ?? '',
                    name: profile?.full_name ?? user.email?.split('@')[0] ?? 'User',
                    subscription: profile?.subscription_status ?? 'free',
                }}
            />

            {/* Main Content */}
            <DashboardContent>
                {children}
            </DashboardContent>
        </div>
    )
}
