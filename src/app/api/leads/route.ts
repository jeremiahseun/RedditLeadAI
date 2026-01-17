import { NextRequest, NextResponse } from 'next/server'
import { LeadRepository, AuthService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { leadId, action } = await request.json()

        if (!leadId || !action) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        switch (action) {
            case 'read':
                await LeadRepository.markAsRead(leadId)
                break
            case 'archive':
                await LeadRepository.archive(leadId)
                break
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Lead action error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
