import { LeadRepository, TrackerRepository } from '@/lib/supabase'
import { AuthService } from '@/lib/supabase/auth'
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface AnalyticsData {
    totalLeads: number
    convertedLeads: number
    conversionRate: number
    leadsBySubreddit: { subreddit: string; count: number; converted: number }[]
    leadsByKeyword: { keyword: string; count: number }[]
}

async function getAnalytics(userId: string): Promise<AnalyticsData> {
    const supabase = await createClient()

    // Get all leads for user
    const { data: leads } = await supabase
        .from('leads')
        .select(`
            id,
            is_converted,
            tracker_id,
            post:posts(subreddit)
        `)
        .eq('user_id', userId)

    // Get trackers for keywords
    const trackers = await TrackerRepository.getForUser(userId)

    const totalLeads = leads?.length ?? 0
    const convertedLeads = leads?.filter(l => l.is_converted).length ?? 0
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    // Group by subreddit
    const subredditMap = new Map<string, { count: number; converted: number }>()
    leads?.forEach(lead => {
        const postData = lead.post as { subreddit: string } | { subreddit: string }[] | null
        const sub = Array.isArray(postData) ? postData[0]?.subreddit : postData?.subreddit ?? 'unknown'
        const existing = subredditMap.get(sub) || { count: 0, converted: 0 }
        existing.count++
        if (lead.is_converted) existing.converted++
        subredditMap.set(sub, existing)
    })

    const leadsBySubreddit = Array.from(subredditMap.entries())
        .map(([subreddit, data]) => ({ subreddit, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    // Count leads per keyword (approximation via tracker keywords)
    const keywordCounts = new Map<string, number>()
    trackers.forEach(tracker => {
        const trackerLeads = leads?.filter(l => l.tracker_id === tracker.id).length ?? 0
        tracker.keywords?.forEach(kw => {
            keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + trackerLeads)
        })
    })

    const leadsByKeyword = Array.from(keywordCounts.entries())
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    return {
        totalLeads,
        convertedLeads,
        conversionRate,
        leadsBySubreddit,
        leadsByKeyword,
    }
}

export default async function AnalyticsPage() {
    const user = await AuthService.getCurrentUser()
    if (!user) return null

    const analytics = await getAnalytics(user.id)

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-slate-400 mt-1">
                    Track your lead performance and conversion rates
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={<Target className="w-5 h-5" />}
                    label="Total Leads"
                    value={analytics.totalLeads}
                    color="purple"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Converted"
                    value={analytics.convertedLeads}
                    color="green"
                />
                <StatCard
                    icon={<Zap className="w-5 h-5" />}
                    label="Conversion Rate"
                    value={`${analytics.conversionRate}%`}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subreddit Performance */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">Subreddit Performance</h2>
                    </div>
                    {analytics.leadsBySubreddit.length === 0 ? (
                        <p className="text-slate-500">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.leadsBySubreddit.map((sub) => (
                                <div key={sub.subreddit} className="flex items-center gap-3">
                                    <span className="text-sm text-purple-400 w-28 truncate">r/{sub.subreddit}</span>
                                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${(sub.count / analytics.totalLeads) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400 w-16 text-right">
                                        {sub.count} leads
                                    </span>
                                    <span className="text-xs text-green-400 w-12 text-right">
                                        {sub.count > 0 ? Math.round((sub.converted / sub.count) * 100) : 0}% conv
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Keyword Effectiveness */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-lg font-semibold text-white">Keyword Effectiveness</h2>
                    </div>
                    {analytics.leadsByKeyword.length === 0 ? (
                        <p className="text-slate-500">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.leadsByKeyword.map((kw) => (
                                <div key={kw.keyword} className="flex items-center gap-3">
                                    <span className="text-sm text-slate-300 w-32 truncate">&quot;{kw.keyword}&quot;</span>
                                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{ width: `${(kw.count / analytics.totalLeads) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400 w-16 text-right">
                                        {kw.count} leads
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode
    label: string
    value: number | string
    color: 'purple' | 'green' | 'yellow'
}) {
    const colorClasses = {
        purple: 'bg-purple-500/20 text-purple-400',
        green: 'bg-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
    )
}
