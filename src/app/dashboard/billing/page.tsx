import { ProfileRepository, AuthService } from '@/lib/supabase'
import { PricingCard } from '@/components/billing/pricing-card'
import { CreditCard, AlertCircle } from 'lucide-react'

export default async function BillingPage() {
    const user = await AuthService.getCurrentUser()
    if (!user) return null

    const profile = await ProfileRepository.getById(user.id)
    const currentPlan = profile?.subscription_status || 'free'

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Billing</h1>
                <p className="text-slate-400 mt-1">
                    Manage your subscription and billing
                </p>
            </div>

            {/* Current Plan Status */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Current Plan</p>
                        <p className="text-xl font-semibold text-white capitalize">{currentPlan}</p>
                    </div>
                    {currentPlan === 'free' && (
                        <div className="ml-auto flex items-center gap-2 text-amber-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{profile?.credits_remaining || 0} credits remaining</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Launch Pricing Banner */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-8 text-center">
                <span className="text-purple-400 font-semibold">🚀 Launch Pricing</span>
                <span className="text-slate-300 mx-2">•</span>
                <span className="text-slate-400">Limited time offer with 3-day free trial</span>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <PricingCard
                    plan="founder"
                    name="Founder"
                    price={5}
                    originalPrice={12}
                    currentPlan={currentPlan}
                    trialDays={3}
                    features={[
                        'Unlimited leads',
                        '5 subreddit trackers',
                        '20 keywords per tracker',
                        'AI-generated replies',
                        'Email notifications',
                    ]}
                />
                <PricingCard
                    plan="agency"
                    name="Agency"
                    price={12}
                    originalPrice={39}
                    currentPlan={currentPlan}
                    isPopular
                    trialDays={3}
                    features={[
                        'Everything in Founder',
                        'Unlimited trackers',
                        'Unlimited keywords',
                        'Priority support',
                        'API access (coming soon)',
                        'Team members (coming soon)',
                    ]}
                />
            </div>

            {/* Free Plan Info */}
            {currentPlan === 'free' && (
                <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Free Plan Limits</h3>
                    <p className="text-slate-400 text-sm">
                        You&apos;re on the free plan with 5 lead credits. Upgrade to get unlimited leads and more features.
                    </p>
                </div>
            )}
        </div>
    )
}
