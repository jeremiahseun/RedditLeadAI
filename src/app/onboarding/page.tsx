'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Package, Search, Hash, Loader2, Sparkles, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface DiscoveredSubreddit {
    name: string
    title: string
    description: string
    subscribers: number
    relevanceScore: number
}

const DEFAULT_SUBREDDITS = [
    { name: 'SaaS', description: 'Software as a Service discussions' },
    { name: 'startups', description: 'Startup founders and entrepreneurs' },
    { name: 'Entrepreneur', description: 'Business and entrepreneurship' },
    { name: 'smallbusiness', description: 'Small business owners' },
    { name: 'indiehackers', description: 'Indie hackers and solo founders' },
    { name: 'webdev', description: 'Web development' },
    { name: 'marketing', description: 'Marketing strategies' },
    { name: 'ecommerce', description: 'E-commerce businesses' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isDiscovering, setIsDiscovering] = useState(false)

    // Form data
    const [productName, setProductName] = useState('')
    const [productDescription, setProductDescription] = useState('')
    const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([])
    const [discoveredSubreddits, setDiscoveredSubreddits] = useState<DiscoveredSubreddit[]>([])
    const [keywords, setKeywords] = useState<string[]>([])
    const [keywordInput, setKeywordInput] = useState('')
    const [competitors, setCompetitors] = useState<string[]>([])
    const [competitorInput, setCompetitorInput] = useState('')
    const [enableGlobalSearch, setEnableGlobalSearch] = useState(true)

    // Product Analysis State
    const [productUrl, setProductUrl] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleAnalyzeProduct = async () => {
        if (!productUrl) return

        setIsAnalyzing(true)
        try {
            const response = await fetch('/api/analyze-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: productUrl }),
            })

            const data = await response.json()

            if (response.ok) {
                if (data.productName) setProductName(data.productName)
                if (data.productDescription) setProductDescription(data.productDescription)
                if (data.keywords && Array.isArray(data.keywords)) {
                    // Combine existing keywords with new ones, avoiding duplicates
                    const newKeywords = [...keywords, ...data.keywords].filter((item, index, arr) => arr.indexOf(item) === index)
                    setKeywords(newKeywords)
                }
                toast.success('Product analyzed successfully!')
            } else {
                toast.error(data.error || 'Failed to analyze product')
            }
        } catch (error) {
            console.error('Analysis error:', error)
            toast.error('Something went wrong')
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Discover subreddits when moving to step 2
    const discoverSubreddits = useCallback(async () => {
        if (!productName && !productDescription) return

        setIsDiscovering(true)
        try {
            const response = await fetch('/api/subreddits/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    productDescription,
                    keywords: [],
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setDiscoveredSubreddits(data.suggestions || [])
            }
        } catch (error) {
            console.error('Discovery error:', error)
        } finally {
            setIsDiscovering(false)
        }
    }, [productName, productDescription])

    // Auto-discover when reaching step 2
    useEffect(() => {
        if (step === 2 && discoveredSubreddits.length === 0) {
            discoverSubreddits()
        }
    }, [step, discoveredSubreddits.length, discoverSubreddits])

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setKeywords([...keywords, keywordInput.trim()])
            setKeywordInput('')
        }
    }

    const handleRemoveKeyword = (keyword: string) => {
        setKeywords(keywords.filter(k => k !== keyword))
    }

    const handleAddCompetitor = () => {
        if (competitorInput.trim() && !competitors.includes(competitorInput.trim())) {
            setCompetitors([...competitors, competitorInput.trim()])
            setCompetitorInput('')
        }
    }

    const handleRemoveCompetitor = (competitor: string) => {
        setCompetitors(competitors.filter(c => c !== competitor))
    }

    const toggleSubreddit = (name: string) => {
        if (selectedSubreddits.includes(name)) {
            setSelectedSubreddits(selectedSubreddits.filter(s => s !== name))
        } else {
            setSelectedSubreddits([...selectedSubreddits, name])
        }
    }

    const handleComplete = async () => {
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Ensure Profile Exists (fixes potential FK errors)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!profile) {
                console.log('Profile missing, creating default profile...')
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email!,
                        full_name: user.user_metadata?.full_name || '',
                        subscription_status: 'free',
                        credits_remaining: 5,
                    })

                if (profileError) {
                    console.error('Error creating profile:', profileError)
                    throw new Error(`Failed to create profile: ${profileError.message}`)
                }
            }

            // Create trackers for selected subreddits
            for (const subredditName of selectedSubreddits) {
                const { data: subreddit, error: subError } = await supabase
                    .from('subreddits')
                    .upsert({ name: subredditName.toLowerCase() }, { onConflict: 'name' })
                    .select()
                    .single()

                if (subError) {
                    console.error('Error upserting subreddit:', subError)
                    continue
                }

                if (subreddit) {
                    // Check if tracker already exists to avoid duplicates
                    const { data: existingTracker } = await supabase
                        .from('user_trackers')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('subreddit_id', subreddit.id)
                        .maybeSingle()

                    if (!existingTracker) {
                        const { error: trackerError } = await supabase
                            .from('user_trackers')
                            .insert({
                                user_id: user.id,
                                subreddit_id: subreddit.id,
                                product_name: productName,
                                product_description: productDescription,
                                keywords: keywords,
                                competitors: competitors,
                                is_active: true,
                            })

                        if (trackerError) {
                            console.error('Error inserting tracker:', trackerError)
                            throw new Error(`Failed to create tracker: ${trackerError.message}`)
                        }
                    } else {
                        // Update existing tracker
                        const { error: updateError } = await supabase
                            .from('user_trackers')
                            .update({
                                product_name: productName,
                                product_description: productDescription,
                                keywords: keywords,
                                competitors: competitors,
                                is_active: true,
                            })
                            .eq('id', existingTracker.id)

                        if (updateError) console.error('Error updating tracker:', updateError)
                    }
                }
            }

            // If global search enabled and no subreddits selected, create a "global" tracker
            if (enableGlobalSearch && selectedSubreddits.length === 0) {
                // Create a placeholder for global search
                const { data: globalSub, error: globalError } = await supabase
                    .from('subreddits')
                    .upsert({ name: '_global_search' }, { onConflict: 'name' })
                    .select()
                    .single()

                if (globalError) {
                    console.error('Error upserting global subreddit:', globalError)
                }

                if (globalSub) {
                    const { data: existingGlobal } = await supabase
                        .from('user_trackers')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('subreddit_id', globalSub.id)
                        .maybeSingle()

                    if (!existingGlobal) {
                        const { error: globalTrackerError } = await supabase
                            .from('user_trackers')
                            .insert({
                                user_id: user.id,
                                subreddit_id: globalSub.id,
                                product_name: productName,
                                product_description: productDescription,
                                keywords: keywords,
                                competitors: competitors,
                                is_active: true,
                            })

                        if (globalTrackerError) {
                            console.error('Error inserting global tracker:', globalTrackerError)
                            throw new Error(`Failed to create global tracker: ${globalTrackerError.message}`)
                        }
                    } else {
                        await supabase
                            .from('user_trackers')
                            .update({
                                product_name: productName,
                                product_description: productDescription,
                                keywords: keywords,
                                competitors: competitors,
                                is_active: true,
                            })
                            .eq('id', existingGlobal.id)
                    }
                }
            }

            toast.success('Setup complete! Finding leads...')
            router.push('/dashboard')
        } catch (error) {
            console.error('Onboarding error:', error)
            toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const formatSubscribers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
        return count.toString()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-12 h-1 rounded-full transition-all ${i <= step ? 'bg-purple-500' : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                    {/* Step 1: Product Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-7 h-7 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Tell us about your product</h2>
                                <p className="text-slate-400 mt-2">This helps our AI find relevant leads</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Product Website (Optional)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={productUrl}
                                        onChange={(e) => setProductUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleAnalyzeProduct}
                                        disabled={isAnalyzing || !productUrl}
                                        type="button"
                                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-purple-400 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isAnalyzing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        Auto-fill
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    We&apos;ll analyze your landing page to automatically fill in the details below.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="e.g., Acme Analytics"
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    What does it do? (2-3 sentences)
                                </label>
                                <textarea
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    placeholder="e.g., A simple analytics tool that helps SaaS founders understand their users without complex setup..."
                                    rows={4}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Subreddits */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-7 h-7 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Where are your customers?</h2>
                                <p className="text-slate-400 mt-2">
                                    Pick subreddits to monitor, or let us search everywhere
                                </p>
                            </div>

                            {/* Global Search Toggle */}
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enableGlobalSearch}
                                        onChange={(e) => setEnableGlobalSearch(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500 mt-0.5"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-purple-400" />
                                            <span className="font-medium text-white">Search all of Reddit</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Find posts in unexpected places (e.g., fashion questions in r/Nigeria)
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* AI Suggested Subreddits */}
                            {isDiscovering ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
                                    <p className="text-slate-400">Discovering relevant subreddits...</p>
                                </div>
                            ) : discoveredSubreddits.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-medium text-slate-300">
                                            AI Suggestions for &quot;{productName}&quot;
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {discoveredSubreddits.slice(0, 8).map((sub) => (
                                            <button
                                                key={sub.name}
                                                onClick={() => toggleSubreddit(sub.name)}
                                                className={`p-3 rounded-xl border text-left transition-all ${selectedSubreddits.includes(sub.name)
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : 'border-slate-700 hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-white text-sm">r/{sub.name}</p>
                                                    <span className="text-xs text-slate-500">
                                                        {formatSubscribers(sub.subscribers)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                    {sub.title || sub.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Default Subreddits */}
                            <div>
                                <span className="text-sm font-medium text-slate-400 mb-3 block">
                                    Popular subreddits
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {DEFAULT_SUBREDDITS.map((sub) => (
                                        <button
                                            key={sub.name}
                                            onClick={() => toggleSubreddit(sub.name)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedSubreddits.includes(sub.name)
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <p className="font-medium text-white text-sm">r/{sub.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{sub.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 text-center">
                                {selectedSubreddits.length > 0
                                    ? `Selected: ${selectedSubreddits.length} subreddit(s)`
                                    : enableGlobalSearch
                                        ? 'Global search enabled - we\'ll find leads everywhere'
                                        : 'Select at least 1 subreddit or enable global search'
                                }
                            </p>
                        </div>
                    )}

                    {/* Step 3: Keywords */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Hash className="w-7 h-7 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Add keywords to track</h2>
                                <p className="text-slate-400 mt-2">We&apos;ll find posts mentioning these</p>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                                    placeholder="Type a keyword and press Enter"
                                    className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    onClick={handleAddKeyword}
                                    className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-900/30 rounded-xl border border-slate-700">
                                {keywords.length === 0 ? (
                                    <p className="text-slate-500 text-sm">No keywords added yet</p>
                                ) : (
                                    keywords.map((keyword) => (
                                        <span
                                            key={keyword}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                                        >
                                            {keyword}
                                            <button
                                                onClick={() => handleRemoveKeyword(keyword)}
                                                className="hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>

                            <p className="text-sm text-slate-500 text-center">
                                Examples: &quot;looking for&quot;, &quot;recommend&quot;, &quot;alternative to&quot;, &quot;best tool for&quot;
                            </p>

                            <div className="pt-6 border-t border-slate-700">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Track Competitors (Optional)</h2>
                                    <p className="text-slate-400 mt-1">We&apos;ll look for people complaining about them</p>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={competitorInput}
                                        onChange={(e) => setCompetitorInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                                        placeholder="Add a competitor name"
                                        className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleAddCompetitor}
                                        className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[50px]">
                                    {competitors.map((competitor) => (
                                        <span
                                            key={competitor}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                                        >
                                            {competitor}
                                            <button
                                                onClick={() => handleRemoveCompetitor(competitor)}
                                                className="hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={
                                    (step === 1 && (!productName || !productDescription)) ||
                                    (step === 2 && selectedSubreddits.length === 0 && !enableGlobalSearch)
                                }
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isLoading || keywords.length === 0}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Setting up...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
