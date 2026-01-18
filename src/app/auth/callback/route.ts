import { createClient } from '@/lib/supabase/server'
import { TrackerRepository } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // Handle error from Supabase
    if (error) {
        console.error('Auth callback error:', error, error_description)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`)
    }

    const supabase = await createClient()

    // Handle PKCE flow (code exchange)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Code exchange error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
        }
    }
    // Handle magic link with token_hash (older flow)
    else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'email' | 'magiclink',
        })

        if (error) {
            console.error('OTP verification error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
        }
    }
    // No valid auth parameters
    else {
        console.error('No code or token_hash provided in callback')
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Check if user is now authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Check if user has completed onboarding
        const hasTrackers = await TrackerRepository.hasTrackers(user.id)

        if (!hasTrackers) {
            return NextResponse.redirect(`${origin}/onboarding`)
        }

        return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
