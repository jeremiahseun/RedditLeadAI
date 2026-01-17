import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin Supabase client for webhooks (bypasses RLS)
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Dodo Payments webhook event structure
 */
interface DodoWebhookEvent {
    type: string
    data: {
        payment_id?: string
        subscription_id?: string
        customer?: {
            email: string
            customer_id?: string
        }
        product_id?: string
        status?: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const event: DodoWebhookEvent = await request.json()

        console.log('Dodo Webhook received:', event.type)

        switch (event.type) {
            case 'payment.succeeded':
                await handlePaymentSucceeded(event.data)
                break

            case 'subscription.active':
                await handleSubscriptionActive(event.data)
                break

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event.data)
                break

            default:
                console.log('Unhandled webhook event:', event.type)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}

async function handlePaymentSucceeded(data: DodoWebhookEvent['data']) {
    const email = data.customer?.email
    if (!email) return

    const supabase = getAdminClient()

    // Update customer ID if provided
    if (data.customer?.customer_id) {
        await supabase
            .from('profiles')
            .update({ dodo_customer_id: data.customer.customer_id })
            .eq('email', email)
    }
}

async function handleSubscriptionActive(data: DodoWebhookEvent['data']) {
    const email = data.customer?.email
    const productId = data.product_id

    if (!email || !productId) return

    const supabase = getAdminClient()

    // Determine subscription tier from product ID
    const subscriptionStatus = mapProductToSubscription(productId)

    await supabase
        .from('profiles')
        .update({
            subscription_status: subscriptionStatus,
            credits_remaining: subscriptionStatus === 'free' ? 5 : 9999,
        })
        .eq('email', email)
}

async function handleSubscriptionCancelled(data: DodoWebhookEvent['data']) {
    const email = data.customer?.email
    if (!email) return

    const supabase = getAdminClient()

    await supabase
        .from('profiles')
        .update({
            subscription_status: 'free',
            credits_remaining: 5,
        })
        .eq('email', email)
}

/**
 * Map Dodo product ID to subscription tier
 */
function mapProductToSubscription(productId: string): 'free' | 'founder' | 'agency' {
    const founderProductId = process.env.DODO_FOUNDER_PRODUCT_ID
    const agencyProductId = process.env.DODO_AGENCY_PRODUCT_ID

    if (productId === founderProductId) return 'founder'
    if (productId === agencyProductId) return 'agency'

    // Fallback matching by name patterns
    if (productId.toLowerCase().includes('founder')) return 'founder'
    if (productId.toLowerCase().includes('agency')) return 'agency'

    return 'free'
}
