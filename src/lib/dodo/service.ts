import DodoPayments from 'dodopayments'

// Detect if we're in development mode (localhost)
const isDevelopment = process.env.NODE_ENV === 'development'

// Wrapper service for Dodo Payments to abstract implementation details
class DodoPaymentsService {
    private client: DodoPayments

    constructor() {
        // Use TEST API key in development, production key otherwise
        const apiKey = isDevelopment
            ? process.env.TEST_DODO_PAYMENTS_API_KEY
            : process.env.DODO_PAYMENTS_API_KEY

        if (!apiKey) {
            console.warn(`[DodoPayments] WARNING: ${isDevelopment ? 'TEST_' : ''}DODO_PAYMENTS_API_KEY is not set`)
        } else {
            console.log(`[DodoPayments] ${isDevelopment ? 'TEST ' : ''}API key loaded (first 10 chars):`, apiKey.substring(0, 10) + '...')
        }
        this.client = new DodoPayments({
            bearerToken: apiKey,
        })
    }

    /**
     * Create a checkout session for subscription
     */
    async createCheckoutSession(params: {
        productId: string
        customerEmail: string
        customerId?: string
    }) {
        try {
            console.log('[DodoPayments] Creating checkout session:', {
                productId: params.productId,
                customerEmail: params.customerEmail,
                mode: isDevelopment ? 'TEST' : 'LIVE',
            })

            const checkoutSession = await this.client.checkoutSessions.create({
                product_cart: [
                    {
                        product_id: params.productId,
                        quantity: 1,
                    },
                ],
                customer: {
                    email: params.customerEmail,
                },
            })

            console.log('[DodoPayments] Checkout session created:', checkoutSession)
            return checkoutSession
        } catch (error) {
            console.error('[DodoPayments] Failed to create checkout session:', error)
            throw error
        }
    }

    /**
     * Get subscription status
     */
    async getSubscription(subscriptionId: string) {
        return await this.client.subscriptions.retrieve(subscriptionId)
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId: string) {
        return await this.client.subscriptions.update(subscriptionId, {
            status: 'cancelled',
        })
    }

    /**
     * List all products
     */
    async listProducts() {
        const products: Array<{
            product_id: string
            name: string
            price: number
        }> = []

        for await (const product of this.client.products.list()) {
            products.push({
                product_id: product.product_id,
                name: product.name ?? '',
                price: typeof product.price === 'number' ? product.price : 0,
            })
        }

        return products
    }
}

// Singleton instance
export const dodoPayments = new DodoPaymentsService()

// Product IDs - use TEST product IDs in development
export const DODO_PRODUCT_IDS = {
    founder: isDevelopment
        ? (process.env.TEST_DODO_FOUNDER_PRODUCT_ID || 'test_founder_plan_id')
        : (process.env.DODO_FOUNDER_PRODUCT_ID || 'founder_plan_id'),
    agency: isDevelopment
        ? (process.env.TEST_DODO_AGENCY_PRODUCT_ID || 'test_agency_plan_id')
        : (process.env.DODO_AGENCY_PRODUCT_ID || 'agency_plan_id'),
} as const

export type DodoPlanType = keyof typeof DODO_PRODUCT_IDS
