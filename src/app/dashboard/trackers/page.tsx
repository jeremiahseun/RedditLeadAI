import { TrackerRepository } from '@/lib/supabase'
import { AuthService } from '@/lib/supabase/auth'
import { TrackersList } from '@/components/trackers/list'
import { Target, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function TrackersPage() {
    const user = await AuthService.getCurrentUser()
    if (!user) return null

    const trackers = await TrackerRepository.getForUser(user.id)

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Trackers</h1>
                    <p className="text-slate-400 mt-1">
                        Manage your subreddit and keyword tracking
                    </p>
                </div>
                <Link
                    href="/onboarding"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Tracker
                </Link>
            </div>

            {trackers.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No trackers yet</h3>
                    <p className="text-slate-400 mb-6">
                        Set up your first tracker to start finding leads
                    </p>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Tracker
                    </Link>
                </div>
            ) : (
                <TrackersList initialTrackers={trackers} />
            )}
        </div>
    )
}
