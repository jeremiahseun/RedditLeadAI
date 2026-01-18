import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
    try {
        const { url } = await req.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL
        let validUrl = url
        if (!url.startsWith('http')) {
            validUrl = `https://${url}`
        }

        // Fetch website content with a standard User-Agent and timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

        const response = await fetch(validUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch website' }, { status: 400 })
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Remove scripts, styles, and other noise
        $('script, style, nav, footer, iframe, svg').remove()

        // Extract text content (limit to first 5000 chars to save tokens)
        const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000)

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `Analyze the following website text and extract product information. Return ONLY valid JSON with these fields:
- productName: The name of the product or company
- productDescription: A concise 2-3 sentence description of what the product does
- keywords: An array of 5-10 relevant keywords for tracking on Reddit (e.g., competitor names, problems solved, industry terms)

Website text:
${text}

Return ONLY the JSON object, no markdown formatting or code blocks.`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Clean up the response (remove markdown code blocks if present)
        const cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        const parsed = JSON.parse(cleanedResponse)

        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze website' },
            { status: 500 }
        )
    }
}
