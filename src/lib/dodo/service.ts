import DodoPayments from 'dodopayments'

// Wrapper service for Dodo Payments to abstract implementation details
class DodoPaymentsService {
    private client: DodoPayments

    constructor() {
        this.client = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY,
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
        const checkoutSession = await this.client.checkoutSessions.create({
            product_cart: [
                {
                    product_id: params.productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: params.customerEmail,
                customer_id: params.customerId,
            },
        })

        return checkoutSession
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

// Product IDs for subscription plans (you'll need to create these in Dodo dashboard)
export const DODO_PRODUCT_IDS = {
    founder: process.env.DODO_FOUNDER_PRODUCT_ID || 'founder_plan_id',
    agency: process.env.DODO_AGENCY_PRODUCT_ID || 'agency_plan_id',
} as const

export type DodoPlanType = keyof typeof DODO_PRODUCT_IDS
