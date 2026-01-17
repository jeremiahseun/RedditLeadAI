import { NextRequest, NextResponse } from 'next/server'
import { TrackerRepository, AuthService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { trackerId, isActive } = await request.json()

        if (!trackerId || typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        await TrackerRepository.toggleActive(trackerId, isActive)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Toggle tracker error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
