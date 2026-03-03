import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { data, error } = await supabase
            .from('empresas')
            .select('id, nombre, plan, estado')
            .order('nombre')

        if (error) throw error
        return NextResponse.json({ data })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
