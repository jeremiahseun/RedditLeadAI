import { createClient } from './server'

/**
 * Authentication service for Supabase
 */
export class AuthService {
    /**
     * Get the current authenticated user
     */
    static async getCurrentUser() {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        return user
    }

    /**
     * Get the current session
     */
    static async getSession() {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()
        return session
    }

    /**
     * Sign out the current user
     */
    static async signOut() {
        const supabase = await createClient()
        await supabase.auth.signOut()
    }

    /**
     * Send a magic link email
     */
    static async sendMagicLink(email: string, redirectTo: string) {
        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo,
            },
        })

        if (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Exchange code for session (used in callback)
     */
    static async exchangeCodeForSession(code: string) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            throw new Error(error.message)
        }
    }
}
