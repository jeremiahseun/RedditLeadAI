import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const USER_AGENT = 'RedditLeadAI/1.0 (github.com/reddit-lead-ai)'

interface RedditPost {
    id: string
    name: string // fullname like t3_xxxxx
    title: string
    selftext: string
    url: string
    permalink: string
    subreddit: string
    author: string
    score: number
    num_comments: number
    created_utc: number
}

interface TrackerWithSubreddit {
    id: string
    user_id: string
    keywords: string[]
    product_name: string | null
    product_description: string | null
    subreddit: {
        id: string
        name: string
    } | null
}

interface GeminiAnalysis {
    score: number
    reason: string
    draft_reply: string
}

/**
 * Fetch posts from a specific subreddit
 */
async function fetchSubredditPosts(subredditName: string): Promise<RedditPost[]> {
    const url = `https://www.reddit.com/r/${subredditName}/new.json?limit=25`

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        })

        if (!response.ok) {
            console.error(`Failed to fetch r/${subredditName}: ${response.status}`)
            return []
        }

        const data = await response.json()
        return data.data.children.map((child: { data: RedditPost }) => child.data)
    } catch (error) {
        console.error(`Error fetching r/${subredditName}:`, error)
        return []
    }
}

/**
 * Search across ALL of Reddit for posts matching a query
 * This catches posts in unexpected subreddits (e.g., fashion in r/Nigeria)
 */
async function searchRedditGlobally(query: string): Promise<RedditPost[]> {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=25&sort=new&type=link`

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        })

        if (!response.ok) {
            console.error(`Reddit search failed: ${response.status}`)
            return []
        }

        const data = await response.json()
        return data.data.children.map((child: { data: RedditPost }) => child.data)
    } catch (error) {
        console.error('Reddit search error:', error)
        return []
    }
}

async function analyzePostWithGemini(
    post: RedditPost,
    productName: string,
    productDescription: string
): Promise<GeminiAnalysis | null> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `You are analyzing a Reddit post to determine if it's a good sales lead for a product.

PRODUCT: ${productName}
PRODUCT DESCRIPTION: ${productDescription}

POST TITLE: ${post.title}
POST BODY: ${post.selftext || '(no body text)'}
SUBREDDIT: r/${post.subreddit}

Analyze this post and respond with a JSON object containing:
1. "score": Integer 0-100 indicating how likely this person could benefit from the product
   - 80-100: Explicitly asking for recommendations or expressing pain point the product solves
   - 60-79: Discussing related problems or showing interest in similar solutions
   - 40-59: Tangentially related topic
   - 0-39: Not relevant, ads, memes, or off-topic

2. "reason": One sentence explaining the score

3. "draft_reply": A 2-3 sentence helpful, non-spammy reply that could subtly introduce the product.
   - Be conversational and helpful first
   - Don't use phrases like "I recommend" or "You should try"
   - Sound like a peer who found something useful
   - Never mention being AI or automated

IMPORTANT:
- Ignore posts that are ads, memes, or simple questions unrelated to the product category
- Only give high scores (70+) if the post clearly shows purchase intent or pain points

Respond ONLY with valid JSON, no markdown or explanation:
{"score": number, "reason": "string", "draft_reply": "string"}`

    try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.error('No JSON found in Gemini response')
            return null
        }

        return JSON.parse(jsonMatch[0]) as GeminiAnalysis
    } catch (error) {
        console.error('Gemini analysis error:', error)
        return null
    }
}

function matchesKeywords(post: RedditPost, keywords: string[]): boolean {
    const textToSearch = `${post.title} ${post.selftext}`.toLowerCase()
    return keywords.some(keyword => textToSearch.includes(keyword.toLowerCase()))
}

/**
 * Store a post in the database if it doesn't exist
 */
async function storePost(post: RedditPost): Promise<void> {
    const postUrl = post.permalink
        ? `https://reddit.com${post.permalink}`
        : `https://reddit.com/r/${post.subreddit}/comments/${post.id}`

    await supabase.from('posts').upsert({
        id: post.name,
        title: post.title,
        body: post.selftext || null,
        url: postUrl,
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
        num_comments: post.num_comments,
        reddit_created_at: new Date(post.created_utc * 1000).toISOString(),
    }, { onConflict: 'id' })
}

/**
 * Create a lead if it doesn't already exist
 */
async function createLeadIfNew(
    userId: string,
    trackerId: string,
    post: RedditPost,
    analysis: GeminiAnalysis
): Promise<boolean> {
    // Check if lead already exists
    const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', post.name)
        .single()

    if (existingLead) {
        return false
    }

    // Only create leads for posts with meaningful scores
    if (analysis.score >= 40) {
        await supabase.from('leads').insert({
            user_id: userId,
            post_id: post.name,
            tracker_id: trackerId,
            ai_score: analysis.score,
            ai_reason: analysis.reason,
            draft_reply: analysis.draft_reply,
            is_read: false,
            is_archived: false,
        })
        console.log(`✅ Lead created (score: ${analysis.score}): ${post.title.substring(0, 50)}...`)
        return true
    }

    return false
}

/**
 * Process posts from specific subreddits
 */
async function processSubredditPosts(tracker: TrackerWithSubreddit): Promise<number> {
    if (!tracker.subreddit) return 0

    const subredditName = tracker.subreddit.name
    console.log(`📍 Fetching r/${subredditName}...`)

    const posts = await fetchSubredditPosts(subredditName)
    console.log(`   Found ${posts.length} posts`)

    let leadsCreated = 0

    for (const post of posts) {
        await storePost(post)

        if (!matchesKeywords(post, tracker.keywords)) {
            continue
        }

        const analysis = await analyzePostWithGemini(
            post,
            tracker.product_name || 'Unknown Product',
            tracker.product_description || 'No description provided'
        )

        if (analysis) {
            const created = await createLeadIfNew(tracker.user_id, tracker.id, post, analysis)
            if (created) leadsCreated++
        }

        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Update last scraped timestamp
    await supabase
        .from('subreddits')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', tracker.subreddit.id)

    return leadsCreated
}

/**
 * Search globally across Reddit for matching posts
 * This finds posts in unexpected subreddits
 */
async function processGlobalSearch(tracker: TrackerWithSubreddit): Promise<number> {
    console.log(`🌍 Global search for keywords: ${tracker.keywords.slice(0, 3).join(', ')}...`)

    let leadsCreated = 0

    // Search for each keyword globally
    for (const keyword of tracker.keywords.slice(0, 3)) { // Limit to 3 to avoid rate limits
        const posts = await searchRedditGlobally(keyword)
        console.log(`   "${keyword}": ${posts.length} posts found`)

        for (const post of posts) {
            await storePost(post)

            const analysis = await analyzePostWithGemini(
                post,
                tracker.product_name || 'Unknown Product',
                tracker.product_description || 'No description provided'
            )

            if (analysis) {
                const created = await createLeadIfNew(tracker.user_id, tracker.id, post, analysis)
                if (created) leadsCreated++
            }

            // Rate limit delay
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Delay between searches
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return leadsCreated
}

async function main(): Promise<void> {
    console.log('🚀 Starting Reddit Lead AI Scraper...\n')

    // Fetch all active trackers with their subreddits
    const { data: trackers, error } = await supabase
        .from('user_trackers')
        .select(`
            id,
            user_id,
            keywords,
            product_name,
            product_description,
            subreddit:subreddits(id, name)
        `)
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching trackers:', error)
        process.exit(1)
    }

    if (!trackers || trackers.length === 0) {
        console.log('No active trackers found')
        return
    }

    console.log(`Found ${trackers.length} active trackers\n`)

    let totalLeads = 0

    for (const rawTracker of trackers) {
        // Normalize subreddit data
        const subredditData = Array.isArray(rawTracker.subreddit)
            ? rawTracker.subreddit[0]
            : rawTracker.subreddit as { id: string; name: string } | null

        const tracker: TrackerWithSubreddit = {
            id: rawTracker.id,
            user_id: rawTracker.user_id,
            keywords: rawTracker.keywords || [],
            product_name: rawTracker.product_name,
            product_description: rawTracker.product_description,
            subreddit: subredditData,
        }

        console.log(`\n📦 Processing tracker: ${tracker.product_name || 'Unnamed'}`)

        // 1. Process specific subreddit
        if (tracker.subreddit) {
            totalLeads += await processSubredditPosts(tracker)
        }

        // 2. Also search globally (catches unexpected subreddits)
        if (tracker.keywords.length > 0) {
            totalLeads += await processGlobalSearch(tracker)
        }

        // Delay between trackers
        await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log(`\n✨ Scraper completed! Created ${totalLeads} new leads.`)
}

main().catch(console.error)
