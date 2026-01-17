import { createClient } from './server'
import type { Profile, Lead, LeadWithPost, UserTracker, UserTrackerWithSubreddit, Subreddit } from '@/types'

/**
 * Repository for profile-related database operations
 */
export class ProfileRepository {
    /**
     * Get user profile by ID
     */
    static async getById(userId: string): Promise<Profile | null> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        return data
    }

    /**
     * Get user profile by email
     */
    static async getByEmail(email: string): Promise<Profile | null> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        return data
    }

    /**
     * Update user profile
     */
    static async update(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        return data
    }

    /**
     * Update subscription status
     */
    static async updateSubscription(
        userId: string,
        status: 'free' | 'founder' | 'agency',
        credits: number = status === 'free' ? 5 : 9999
    ): Promise<void> {
        const supabase = await createClient()
        await supabase
            .from('profiles')
            .update({
                subscription_status: status,
                credits_remaining: credits
            })
            .eq('id', userId)
    }
}

/**
 * Repository for lead-related database operations
 */
export class LeadRepository {
    /**
     * Get leads for a user with post data
     */
    static async getForUser(
        userId: string,
        options: {
            includeArchived?: boolean
            limit?: number
        } = {}
    ): Promise<LeadWithPost[]> {
        const { includeArchived = false, limit = 50 } = options
        const supabase = await createClient()

        let query = supabase
            .from('leads')
            .select(`
        *,
        post:posts(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!includeArchived) {
            query = query.eq('is_archived', false)
        }

        const { data } = await query
        return (data ?? []) as LeadWithPost[]
    }

    /**
     * Get unread lead count for a user
     */
    static async getUnreadCount(userId: string): Promise<number> {
        const supabase = await createClient()
        const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)
            .eq('is_archived', false)

        return count ?? 0
    }

    /**
     * Mark a lead as read
     */
    static async markAsRead(leadId: string): Promise<void> {
        const supabase = await createClient()
        await supabase
            .from('leads')
            .update({ is_read: true })
            .eq('id', leadId)
    }

    /**
     * Archive a lead
     */
    static async archive(leadId: string): Promise<void> {
        const supabase = await createClient()
        await supabase
            .from('leads')
            .update({ is_archived: true })
            .eq('id', leadId)
    }
}

/**
 * Repository for tracker-related database operations
 */
export class TrackerRepository {
    /**
     * Get all trackers for a user with subreddit data
     */
    static async getForUser(userId: string): Promise<UserTrackerWithSubreddit[]> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('user_trackers')
            .select(`
        *,
        subreddit:subreddits(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        return (data ?? []) as UserTrackerWithSubreddit[]
    }

    /**
     * Create a new tracker
     */
    static async create(tracker: {
        userId: string
        subredditId: string
        productName: string
        productDescription: string
        keywords: string[]
    }): Promise<UserTracker | null> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('user_trackers')
            .insert({
                user_id: tracker.userId,
                subreddit_id: tracker.subredditId,
                product_name: tracker.productName,
                product_description: tracker.productDescription,
                keywords: tracker.keywords,
            })
            .select()
            .single()

        return data
    }

    /**
     * Toggle tracker active status
     */
    static async toggleActive(trackerId: string, isActive: boolean): Promise<void> {
        const supabase = await createClient()
        await supabase
            .from('user_trackers')
            .update({ is_active: isActive })
            .eq('id', trackerId)
    }

    /**
     * Delete a tracker
     */
    static async delete(trackerId: string): Promise<void> {
        const supabase = await createClient()
        await supabase
            .from('user_trackers')
            .delete()
            .eq('id', trackerId)
    }

    /**
     * Check if user has any trackers (for onboarding check)
     */
    static async hasTrackers(userId: string): Promise<boolean> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('user_trackers')
            .select('id')
            .eq('user_id', userId)
            .limit(1)

        return (data?.length ?? 0) > 0
    }
}

/**
 * Repository for subreddit-related database operations
 */
export class SubredditRepository {
    /**
     * Get or create a subreddit by name
     */
    static async upsert(name: string): Promise<Subreddit | null> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('subreddits')
            .upsert({ name: name.toLowerCase() }, { onConflict: 'name' })
            .select()
            .single()

        return data
    }

    /**
     * Get all subreddits
     */
    static async getAll(): Promise<Subreddit[]> {
        const supabase = await createClient()
        const { data } = await supabase
            .from('subreddits')
            .select('*')
            .order('name')

        return data ?? []
    }
}
