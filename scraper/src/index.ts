import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

interface RedditPost {
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

interface TrackerWithSubreddit {
    id: string
    user_id: string
    keywords: string[]
    product_name: string | null
    product_description: string | null
    subreddit: {
        id: string
        name: string
    }
}

interface GeminiAnalysis {
    score: number
    reason: string
    draft_reply: string
}

async function fetchRedditPosts(subredditName: string): Promise<RedditPost[]> {
    const url = `https://www.reddit.com/r/${subredditName}/new.json?limit=25`

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'RedditLeadAI/1.0 (github.com/reddit-lead-ai)',
            },
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

async function processTracker(tracker: TrackerWithSubreddit): Promise<void> {
    const subredditName = tracker.subreddit.name
    console.log(`Processing r/${subredditName} for tracker ${tracker.id}`)

    // Fetch recent posts
    const posts = await fetchRedditPosts(subredditName)
    console.log(`Fetched ${posts.length} posts from r/${subredditName}`)

    for (const post of posts) {
        // Check if post already exists
        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('id', post.name)
            .single()

        if (!existingPost) {
            // Insert new post
            await supabase.from('posts').insert({
                id: post.name,
                title: post.title,
                body: post.selftext || null,
                url: `https://reddit.com${post.url || `/r/${post.subreddit}/comments/${post.id}`}`,
                subreddit: post.subreddit,
                author: post.author,
                score: post.score,
                num_comments: post.num_comments,
                reddit_created_at: new Date(post.created_utc * 1000).toISOString(),
            })
        }

        // Check if this post matches keywords
        if (!matchesKeywords(post, tracker.keywords)) {
            continue
        }

        // Check if lead already exists for this user and post
        const { data: existingLead } = await supabase
            .from('leads')
            .select('id')
            .eq('user_id', tracker.user_id)
            .eq('post_id', post.name)
            .single()

        if (existingLead) {
            continue
        }

        // Analyze with Gemini
        console.log(`Analyzing post: ${post.title.substring(0, 50)}...`)
        const analysis = await analyzePostWithGemini(
            post,
            tracker.product_name || 'Unknown Product',
            tracker.product_description || 'No description provided'
        )

        if (!analysis) {
            continue
        }

        // Only create leads for posts with meaningful scores
        if (analysis.score >= 40) {
            await supabase.from('leads').insert({
                user_id: tracker.user_id,
                post_id: post.name,
                tracker_id: tracker.id,
                ai_score: analysis.score,
                ai_reason: analysis.reason,
                draft_reply: analysis.draft_reply,
                is_read: false,
                is_archived: false,
            })
            console.log(`Created lead with score ${analysis.score}: ${post.title.substring(0, 50)}...`)
        }
    }

    // Update last scraped timestamp
    await supabase
        .from('subreddits')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', tracker.subreddit.id)
}

async function main(): Promise<void> {
    console.log('Starting Reddit scraper...')

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

    console.log(`Found ${trackers.length} active trackers`)

    // Group trackers by subreddit to avoid duplicate fetches
    const subredditTrackers = new Map<string, TrackerWithSubreddit[]>()

    for (const tracker of trackers) {
        // Handle the nested subreddit data
        const subredditData = Array.isArray(tracker.subreddit)
            ? tracker.subreddit[0]
            : tracker.subreddit as { id: string; name: string } | null

        if (!subredditData) continue

        const trackerWithSub: TrackerWithSubreddit = {
            id: tracker.id,
            user_id: tracker.user_id,
            keywords: tracker.keywords || [],
            product_name: tracker.product_name,
            product_description: tracker.product_description,
            subreddit: subredditData,
        }

        const key = subredditData.name
        if (!subredditTrackers.has(key)) {
            subredditTrackers.set(key, [])
        }
        subredditTrackers.get(key)!.push(trackerWithSub)
    }

    // Process each tracker
    for (const [, trackerGroup] of subredditTrackers) {
        for (const tracker of trackerGroup) {
            await processTracker(tracker)
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    console.log('Scraper completed successfully')
}

main().catch(console.error)
