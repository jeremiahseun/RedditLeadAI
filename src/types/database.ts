// Database types for Supabase tables

export interface Profile {
    id: string
    email: string
    full_name: string | null
    subscription_status: 'free' | 'founder' | 'agency'
    credits_remaining: number
    dodo_customer_id: string | null
    created_at: string
    updated_at: string
}

export interface Subreddit {
    id: string
    name: string
    display_name: string | null
    subscriber_count: number | null
    last_scraped_at: string | null
    created_at: string
}

export interface UserTracker {
    id: string
    user_id: string
    subreddit_id: string
    keywords: string[]
    product_name: string | null
    product_description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface UserTrackerWithSubreddit extends UserTracker {
    subreddit: Subreddit
}

export interface Post {
    id: string // Reddit fullname (t3_xxxxx)
    title: string
    body: string | null
    url: string
    subreddit: string
    author: string | null
    score: number
    num_comments: number
    reddit_created_at: string | null
    created_at: string
}

export interface Lead {
    id: string
    user_id: string
    post_id: string
    tracker_id: string | null
    ai_score: number
    ai_reason: string | null
    draft_reply: string | null
    is_read: boolean
    is_archived: boolean
    created_at: string
}

export interface LeadWithPost extends Lead {
    post: Post
}

// Subscription plan limits
export const PLAN_LIMITS = {
    free: {
        subreddits: 1,
        keywords: 2,
        leads_per_month: 5,
        competitors: 0,
    },
    founder: {
        subreddits: 10,
        keywords: Infinity,
        leads_per_month: Infinity,
        competitors: 3,
    },
    agency: {
        subreddits: 50,
        keywords: Infinity,
        leads_per_month: Infinity,
        competitors: 10,
    },
} as const

export type SubscriptionPlan = keyof typeof PLAN_LIMITS
