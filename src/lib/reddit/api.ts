/**
 * Reddit API utilities for searching and discovering content
 */

const REDDIT_BASE_URL = 'https://www.reddit.com'
const USER_AGENT = 'Rader/1.0 (github.com/reddit-lead-ai)'

interface RedditSearchResult {
    id: string
    name: string // fullname like t3_xxxxx
    title: string
    selftext: string
    url: string
    subreddit: string
    author: string
    score: number
    num_comments: number
    created_utc: number
}

interface SubredditInfo {
    name: string
    display_name: string
    title: string
    public_description: string
    subscribers: number
    url: string
}

/**
 * Search across ALL of Reddit for posts matching keywords
 * This catches posts in unexpected subreddits
 */
export async function searchRedditGlobally(
    query: string,
    options: { limit?: number; sort?: 'relevance' | 'new' | 'hot' } = {}
): Promise<RedditSearchResult[]> {
    const { limit = 25, sort = 'relevance' } = options

    const url = `${REDDIT_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=${sort}&type=link`

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        })

        if (!response.ok) {
            console.error(`Reddit search error: ${response.status}`)
            return []
        }

        const data = await response.json()
        return data.data.children.map((child: { data: RedditSearchResult }) => child.data)
    } catch (error) {
        console.error('Reddit search error:', error)
        return []
    }
}

/**
 * Search for subreddits related to a query
 * Used for subreddit discovery/suggestions
 */
export async function searchSubreddits(query: string, limit = 10): Promise<SubredditInfo[]> {
    const url = `${REDDIT_BASE_URL}/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}`

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        })

        if (!response.ok) {
            console.error(`Subreddit search error: ${response.status}`)
            return []
        }

        const data = await response.json()
        return data.data.children.map((child: { data: SubredditInfo }) => ({
            name: child.data.display_name,
            display_name: child.data.display_name,
            title: child.data.title,
            public_description: child.data.public_description,
            subscribers: child.data.subscribers,
            url: child.data.url,
        }))
    } catch (error) {
        console.error('Subreddit search error:', error)
        return []
    }
}

/**
 * Get new posts from a specific subreddit
 */
export async function getSubredditPosts(
    subredditName: string,
    options: { limit?: number; sort?: 'new' | 'hot' | 'top' } = {}
): Promise<RedditSearchResult[]> {
    const { limit = 25, sort = 'new' } = options

    const url = `${REDDIT_BASE_URL}/r/${subredditName}/${sort}.json?limit=${limit}`

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        })

        if (!response.ok) {
            console.error(`Subreddit fetch error: ${response.status}`)
            return []
        }

        const data = await response.json()
        return data.data.children.map((child: { data: RedditSearchResult }) => child.data)
    } catch (error) {
        console.error('Subreddit fetch error:', error)
        return []
    }
}

/**
 * Get trending/popular subreddits
 */
export async function getPopularSubreddits(limit = 25): Promise<SubredditInfo[]> {
    const url = `${REDDIT_BASE_URL}/subreddits/popular.json?limit=${limit}`

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        })

        if (!response.ok) return []

        const data = await response.json()
        return data.data.children.map((child: { data: SubredditInfo }) => ({
            name: child.data.display_name,
            display_name: child.data.display_name,
            title: child.data.title,
            public_description: child.data.public_description,
            subscribers: child.data.subscribers,
            url: child.data.url,
        }))
    } catch {
        return []
    }
}
