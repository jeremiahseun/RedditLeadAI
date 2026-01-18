import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { leadId, action } = await req.json()

        if (!leadId || !action) {
            return NextResponse.json({ error: 'Missing leadId or action' }, { status: 400 })
        }

        // Verify the lead belongs to the user
        const { data: lead } = await supabase
            .from('leads')
            .select('id')
            .eq('id', leadId)
            .eq('user_id', user.id)
            .single()

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        if (action === 'convert') {
            await supabase
                .from('leads')
                .update({
                    is_converted: true,
                    converted_at: new Date().toISOString()
                })
                .eq('id', leadId)
        } else if (action === 'unconvert') {
            await supabase
                .from('leads')
                .update({
                    is_converted: false,
                    converted_at: null
                })
                .eq('id', leadId)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Conversion error:', error)
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }
}
