import { NextRequest, NextResponse } from 'next/server'
import { dodoPayments, DODO_PRODUCT_IDS, DodoPlanType } from '@/lib/dodo'
import { AuthService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        // Validate environment variables
        if (!process.env.DODO_PAYMENTS_API_KEY) {
            console.error('[Checkout] Missing DODO_PAYMENTS_API_KEY')
            return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
        }

        const user = await AuthService.getCurrentUser()
        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { plan } = await request.json() as { plan: DodoPlanType }

        if (!plan || !DODO_PRODUCT_IDS[plan]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const productId = DODO_PRODUCT_IDS[plan]

        // Check if product ID is a placeholder
        if (productId.includes('_plan_id')) {
            console.error(`[Checkout] Product ID for ${plan} is a placeholder: ${productId}`)
            return NextResponse.json({ error: `Product ID for ${plan} plan not configured` }, { status: 500 })
        }

        console.log(`[Checkout] Creating session for ${plan} plan (${productId}) for user ${user.email}`)

        const session = await dodoPayments.createCheckoutSession({
            productId,
            customerEmail: user.email,
            customerId: user.id,
        })

        // The session contains a URL to redirect the user to
        return NextResponse.json({
            checkoutUrl: session.checkout_url,
            sessionId: session.session_id,
        })
    } catch (error) {
        console.error('[Checkout] Error:', error)
        const message = error instanceof Error ? error.message : 'Failed to create checkout'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
