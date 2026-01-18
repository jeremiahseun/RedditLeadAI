'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check, Archive, ChevronDown, ChevronUp, Loader2, Target, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { LeadWithPost } from '@/types'

interface LeadsInboxProps {
    initialLeads: LeadWithPost[]
    hasTrackers: boolean
}

export function LeadsInbox({ initialLeads, hasTrackers }: LeadsInboxProps) {
    const [leads, setLeads] = useState(initialLeads)
    const [expandedLead, setExpandedLead] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopyReply = async (leadId: string, text: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedId(leadId)
        toast.success('Reply copied to clipboard!')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleMarkRead = async (leadId: string) => {
        // Optimistic update
        setLeads(prev =>
            prev.map(lead => lead.id === leadId ? { ...lead, is_read: true } : lead)
        )

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, action: 'read' }),
            })
        } catch {
            // Revert on error
            setLeads(prev =>
                prev.map(lead => lead.id === leadId ? { ...lead, is_read: false } : lead)
            )
        }
    }

    const handleArchive = async (leadId: string) => {
        const leadToArchive = leads.find(l => l.id === leadId)

        // Optimistic update
        setLeads(prev => prev.filter(lead => lead.id !== leadId))
        toast.success('Lead archived')

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, action: 'archive' }),
            })

            if (!response.ok) throw new Error('Failed to archive')
        } catch {
            // Revert on error
            if (leadToArchive) {
                setLeads(prev => [...prev, leadToArchive])
            }
            toast.error('Failed to archive lead')
        }
    }

    const handleConvert = async (leadId: string, currentState: boolean) => {
        // Optimistic update
        setLeads(prev =>
            prev.map(lead => lead.id === leadId ? { ...lead, is_converted: !currentState } : lead)
        )
        toast.success(currentState ? 'Conversion removed' : 'Lead marked as converted!')

        try {
            const response = await fetch('/api/leads/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, action: currentState ? 'unconvert' : 'convert' }),
            })

            if (!response.ok) throw new Error('Failed to update')
        } catch {
            // Revert on error
            setLeads(prev =>
                prev.map(lead => lead.id === leadId ? { ...lead, is_converted: currentState } : lead)
            )
            toast.error('Failed to update lead')
        }
    }

    if (leads.length === 0) {
        return <EmptyState hasTrackers={hasTrackers} />
    }

    return (
        <div className="space-y-3">
            {leads.map((lead) => (
                <LeadCard
                    key={lead.id}
                    lead={lead}
                    isExpanded={expandedLead === lead.id}
                    isCopied={copiedId === lead.id}
                    onToggle={() => {
                        setExpandedLead(expandedLead === lead.id ? null : lead.id)
                        if (!lead.is_read) handleMarkRead(lead.id)
                    }}
                    onCopy={(text) => handleCopyReply(lead.id, text)}
                    onArchive={() => handleArchive(lead.id)}
                    onConvert={() => handleConvert(lead.id, lead.is_converted)}
                />
            ))}
        </div>
    )
}

function EmptyState({ hasTrackers }: { hasTrackers: boolean }) {
    if (hasTrackers) {
        return (
            <div className="bg-slate-900/50 border border-purple-500/30 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Actively searching...</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                    Our AI is scanning Reddit for leads matching your trackers. New leads typically appear within 15-30 minutes.
                </p>
                <Link
                    href="/dashboard/trackers"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mt-4 text-sm"
                >
                    <Target className="w-4 h-4" />
                    View your trackers
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No leads yet</h3>
            <p className="text-slate-400 mb-6">
                Set up a tracker to start finding leads on Reddit.
            </p>
            <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
                Create Tracker
            </Link>
        </div>
    )
}

interface LeadCardProps {
    lead: LeadWithPost
    isExpanded: boolean
    isCopied: boolean
    onToggle: () => void
    onCopy: (text: string) => void
    onArchive: () => void
    onConvert: () => void
}

function LeadCard({ lead, isExpanded, isCopied, onToggle, onCopy, onArchive, onConvert }: LeadCardProps) {
    const post = lead.post

    return (
        <div
            className={`bg-slate-900/50 border rounded-xl transition-all ${lead.is_read ? 'border-slate-800' : 'border-purple-500/30 bg-purple-500/5'
                }`}
        >
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-start gap-4 text-left"
            >
                <ScoreBadge score={lead.ai_score} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-purple-400 font-medium">r/{post.subreddit}</span>
                        {!lead.is_read && <span className="w-2 h-2 bg-purple-500 rounded-full" />}
                    </div>
                    <h3 className="text-white font-medium line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                        {post.body || 'No body text'}
                    </p>
                </div>

                <div className="text-slate-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {lead.ai_reason && (
                        <InfoBlock label="AI Analysis" content={lead.ai_reason} />
                    )}

                    {lead.draft_reply && (
                        <InfoBlock label="Suggested Reply" content={lead.draft_reply} />
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            onClick={() => lead.draft_reply && onCopy(lead.draft_reply)}
                            disabled={!lead.draft_reply}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Reply
                                </>
                            )}
                        </button>

                        <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open on Reddit
                        </a>

                        <button
                            onClick={onConvert}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${lead.is_converted
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'
                                }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            {lead.is_converted ? 'Converted' : 'Mark Converted'}
                        </button>

                        <button
                            onClick={onArchive}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-all ml-auto"
                        >
                            <Archive className="w-4 h-4" />
                            Archive
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function ScoreBadge({ score }: { score: number }) {
    const getColor = () => {
        if (score >= 80) return 'bg-green-500'
        if (score >= 60) return 'bg-yellow-500'
        if (score >= 40) return 'bg-orange-500'
        return 'bg-red-500'
    }

    return (
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className={`w-10 h-10 rounded-full ${getColor()} flex items-center justify-center text-white font-bold text-sm`}>
                {score}
            </div>
            <span className="text-xs text-slate-500">Score</span>
        </div>
    )
}

function InfoBlock({ label, content }: { label: string; content: string }) {
    return (
        <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{content}</p>
        </div>
    )
}
