'use client'

export function DashboardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-8 bg-slate-800 rounded-lg w-48 mb-2"></div>
                <div className="h-4 bg-slate-800 rounded-lg w-32"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
                                <div className="h-3 bg-slate-700 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-full"></div>
        </div>
    )
}
