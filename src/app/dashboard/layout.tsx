import { ProfileRepository } from '@/lib/supabase'
import { AuthService } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardContent } from '@/components/dashboard/content'
import { unstable_cache } from 'next/cache'

// Cache user profile data for 60 seconds to avoid refetching on every navigation
const getCachedProfile = unstable_cache(
    async (userId: string) => {
        return await ProfileRepository.getById(userId)
    },
    ['user-profile'],
    { revalidate: 60 }
)

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await AuthService.getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const profile = await getCachedProfile(user.id)

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
