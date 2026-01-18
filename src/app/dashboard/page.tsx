import { LeadRepository, TrackerRepository } from '@/lib/supabase'
import { AuthService } from '@/lib/supabase/auth'
import { LeadsInbox } from '@/components/leads/inbox'

export default async function DashboardPage() {
    const user = await AuthService.getCurrentUser()
    if (!user) return null

    const [leads, unreadCount, hasTrackers] = await Promise.all([
        LeadRepository.getForUser(user.id, { limit: 50 }),
        LeadRepository.getUnreadCount(user.id),
        TrackerRepository.hasTrackers(user.id),
    ])

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Leads Inbox</h1>
                <p className="text-slate-400 mt-1">
                    {unreadCount ? `${unreadCount} unread lead${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
            </div>

            <LeadsInbox initialLeads={leads} hasTrackers={hasTrackers} />
        </div>
    )
}
