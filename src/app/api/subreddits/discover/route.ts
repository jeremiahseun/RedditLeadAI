import { NextRequest, NextResponse } from 'next/server'
import { searchSubreddits } from '@/lib/reddit'
import { AuthService } from '@/lib/supabase'

/**
 * API route to discover subreddits based on a product description
 * Uses Reddit's subreddit search + AI suggestions
 */
export async function POST(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productName, productDescription, keywords } = await request.json()

        if (!productName && !productDescription && !keywords?.length) {
            return NextResponse.json({ error: 'Provide product info or keywords' }, { status: 400 })
        }

        // Build search queries from product info
        const searchQueries = new Set<string>()

        if (productName) {
            searchQueries.add(productName)
        }

        if (keywords?.length) {
            keywords.forEach((k: string) => searchQueries.add(k))
        }

        // Extract key terms from description
        if (productDescription) {
            const terms = extractKeyTerms(productDescription)
            terms.forEach(t => searchQueries.add(t))
        }

        // Search Reddit for subreddits matching each query
        const subredditMap = new Map<string, {
            name: string
            title: string
            description: string
            subscribers: number
            relevanceScore: number
        }>()

        for (const query of searchQueries) {
            const results = await searchSubreddits(query, 5)

            for (const sub of results) {
                if (subredditMap.has(sub.name.toLowerCase())) {
                    // Increase relevance if found multiple times
                    const existing = subredditMap.get(sub.name.toLowerCase())!
                    existing.relevanceScore += 1
                } else {
                    subredditMap.set(sub.name.toLowerCase(), {
                        name: sub.name,
                        title: sub.title || sub.name,
                        description: sub.public_description || '',
                        subscribers: sub.subscribers || 0,
                        relevanceScore: 1,
                    })
                }
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 100))
        }

        // Sort by relevance score, then subscribers
        const suggestions = Array.from(subredditMap.values())
            .sort((a, b) => {
                if (b.relevanceScore !== a.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore
                }
                return b.subscribers - a.subscribers
            })
            .slice(0, 15)

        return NextResponse.json({
            suggestions,
            searchedTerms: Array.from(searchQueries),
        })
    } catch (error) {
        console.error('Subreddit discovery error:', error)
        return NextResponse.json({ error: 'Discovery failed' }, { status: 500 })
    }
}

/**
 * Extract key terms from a product description
 */
function extractKeyTerms(description: string): string[] {
    // Remove common words and extract meaningful terms
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
        'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
        'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
        'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
        'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
        'because', 'until', 'while', 'that', 'which', 'who', 'whom', 'this',
        'these', 'those', 'am', 'your', 'you', 'our', 'we', 'they', 'their',
        'its', 'my', 'me', 'him', 'her', 'it', 'us', 'them', 'what', 'i',
    ])

    const words = description
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))

    // Get unique words
    return [...new Set(words)].slice(0, 5)
}
