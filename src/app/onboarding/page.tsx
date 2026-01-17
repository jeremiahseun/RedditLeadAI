'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Package, Search, Hash, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const SUGGESTED_SUBREDDITS = [
    { name: 'SaaS', description: 'Software as a Service discussions' },
    { name: 'startups', description: 'Startup founders and entrepreneurs' },
    { name: 'Entrepreneur', description: 'Business and entrepreneurship' },
    { name: 'smallbusiness', description: 'Small business owners' },
    { name: 'indiehackers', description: 'Indie hackers and solo founders' },
    { name: 'webdev', description: 'Web development' },
    { name: 'marketing', description: 'Marketing strategies' },
    { name: 'socialmedia', description: 'Social media marketing' },
    { name: 'ecommerce', description: 'E-commerce businesses' },
    { name: 'gamedev', description: 'Game development' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    // Form data
    const [productName, setProductName] = useState('')
    const [productDescription, setProductDescription] = useState('')
    const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([])
    const [keywords, setKeywords] = useState<string[]>([])
    const [keywordInput, setKeywordInput] = useState('')

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setKeywords([...keywords, keywordInput.trim()])
            setKeywordInput('')
        }
    }

    const handleRemoveKeyword = (keyword: string) => {
        setKeywords(keywords.filter(k => k !== keyword))
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

            // Create or get subreddits
            for (const subredditName of selectedSubreddits) {
                // Upsert subreddit
                const { data: subreddit } = await supabase
                    .from('subreddits')
                    .upsert({ name: subredditName.toLowerCase() }, { onConflict: 'name' })
                    .select()
                    .single()

                if (subreddit) {
                    // Create user tracker
                    await supabase
                        .from('user_trackers')
                        .insert({
                            user_id: user.id,
                            subreddit_id: subreddit.id,
                            product_name: productName,
                            product_description: productDescription,
                            keywords: keywords,
                        })
                }
            }

            toast.success('Setup complete!')
            router.push('/dashboard')
        } catch (error) {
            console.error('Onboarding error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
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
                                <p className="text-slate-400 mt-2">This helps our AI generate relevant replies</p>
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
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-7 h-7 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Pick subreddits to monitor</h2>
                                <p className="text-slate-400 mt-2">Select where your customers hang out</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {SUGGESTED_SUBREDDITS.map((sub) => (
                                    <button
                                        key={sub.name}
                                        onClick={() => toggleSubreddit(sub.name)}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedSubreddits.includes(sub.name)
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <p className="font-medium text-white">r/{sub.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">{sub.description}</p>
                                    </button>
                                ))}
                            </div>

                            <p className="text-sm text-slate-500 text-center">
                                Selected: {selectedSubreddits.length} subreddit(s)
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
                                    (step === 2 && selectedSubreddits.length === 0)
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
