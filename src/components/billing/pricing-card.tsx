'use client'

import { useState } from 'react'
import { Loader2, CreditCard, Check, Sparkles, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface PricingCardProps {
    plan: 'founder' | 'agency'
    name: string
    price: number
    originalPrice?: number
    features: string[]
    isPopular?: boolean
    currentPlan?: string
    trialDays?: number
}

export function PricingCard({
    plan,
    name,
    price,
    originalPrice,
    features,
    isPopular,
    currentPlan,
    trialDays
}: PricingCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const isCurrentPlan = currentPlan === plan

    const handleSubscribe = async () => {
        setIsLoading(true)

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout')
            }

            // Redirect to Dodo checkout
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                toast.error('No checkout URL returned')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error('Failed to start checkout. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`relative glass-card p-8 hover-lift ${isPopular ? 'border-purple-500 glow-subtle' : ''
            }`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 pulse-glow">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                    </span>
                </div>
            )}

            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <div className="mt-4">
                    {originalPrice && (
                        <span className="text-lg text-slate-500 line-through mr-2">${originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold gradient-text">${price}</span>
                    <span className="text-slate-400">/month</span>
                </div>
                {trialDays && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-green-400 text-sm">
                        <Zap className="w-3 h-3" />
                        <span>{trialDays}-day free trial</span>
                    </div>
                )}
            </div>

            <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>

            <button
                onClick={handleSubscribe}
                disabled={isLoading || isCurrentPlan}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isCurrentPlan
                    ? 'bg-green-500/20 text-green-400 cursor-default'
                    : isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    } disabled:opacity-50`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : isCurrentPlan ? (
                    <>
                        <Check className="w-4 h-4" />
                        Current Plan
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4" />
                        Subscribe
                    </>
                )}
            </button>
        </div>
    )
}
