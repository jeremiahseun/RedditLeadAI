import { NextRequest, NextResponse } from 'next/server'
import { dodoPayments, DODO_PRODUCT_IDS, DodoPlanType } from '@/lib/dodo'
import { AuthService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { plan } = await request.json() as { plan: DodoPlanType }

        if (!plan || !DODO_PRODUCT_IDS[plan]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const productId = DODO_PRODUCT_IDS[plan]

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
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }
}
