'use client'

import { useState } from 'react'
import { Power, PowerOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserTrackerWithSubreddit } from '@/types'

interface TrackersListProps {
    initialTrackers: UserTrackerWithSubreddit[]
}

export function TrackersList({ initialTrackers }: TrackersListProps) {
    const [trackers, setTrackers] = useState(initialTrackers)

    const handleToggle = async (trackerId: string, currentState: boolean) => {
        // Optimistic update
        setTrackers(prev =>
            prev.map(t => t.id === trackerId ? { ...t, is_active: !currentState } : t)
        )

        try {
            const response = await fetch('/api/trackers/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackerId, isActive: !currentState }),
            })

            if (!response.ok) throw new Error('Failed to toggle')
            toast.success(currentState ? 'Tracker paused' : 'Tracker activated')
        } catch {
            // Revert on error
            setTrackers(prev =>
                prev.map(t => t.id === trackerId ? { ...t, is_active: currentState } : t)
            )
            toast.error('Failed to update tracker')
        }
    }

    const handleDelete = async (trackerId: string) => {
        if (!confirm('Are you sure you want to delete this tracker?')) return

        const tracker = trackers.find(t => t.id === trackerId)
        setTrackers(prev => prev.filter(t => t.id !== trackerId))

        try {
            const response = await fetch('/api/trackers/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackerId }),
            })

            if (!response.ok) throw new Error('Failed to delete')
            toast.success('Tracker deleted')
        } catch {
            // Revert on error
            if (tracker) {
                setTrackers(prev => [...prev, tracker])
            }
            toast.error('Failed to delete tracker')
        }
    }

    return (
        <div className="space-y-4">
            {trackers.map((tracker) => (
                <TrackerCard
                    key={tracker.id}
                    tracker={tracker}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    )
}

function TrackerCard({
    tracker,
    onToggle,
    onDelete
}: {
    tracker: UserTrackerWithSubreddit
    onToggle: (id: string, currentState: boolean) => void
    onDelete: (id: string) => void
}) {
    const subredditName = tracker.subreddit?.name || 'unknown'

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-purple-400 font-medium">
                            r/{subredditName}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${tracker.is_active
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}>
                            {tracker.is_active ? 'Active' : 'Paused'}
                        </span>
                    </div>

                    <p className="text-white font-medium">{tracker.product_name}</p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {tracker.product_description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {tracker.keywords?.map((keyword) => (
                            <span
                                key={keyword}
                                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md text-xs"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={() => onToggle(tracker.id, tracker.is_active)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title={tracker.is_active ? 'Pause' : 'Activate'}
                    >
                        {tracker.is_active ? (
                            <PowerOff className="w-4 h-4" />
                        ) : (
                            <Power className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={() => onDelete(tracker.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
