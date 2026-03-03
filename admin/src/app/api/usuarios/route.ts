import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Forzar modo dinámico — evita evaluación en build time (sin env vars)
export const dynamic = 'force-dynamic'

// Factory: crear cliente admin en runtime, no a nivel de módulo
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── GET: listar todos los admins ─────────────────────────────
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { data: perfil } = await supabase
            .from('perfiles').select('rol').eq('id', user.id).single()
        if (perfil?.rol !== 'superadmin')
            return NextResponse.json({ error: 'Solo superadmin' }, { status: 403 })

        const { data, error } = await supabase
            .from('perfiles')
            .select('*, empresas(id, nombre)')
            .in('rol', ['admin', 'superadmin'])
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

// ── POST: crear nuevo admin ──────────────────────────────────
export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { data: perfil } = await supabase
            .from('perfiles').select('rol').eq('id', user.id).single()
        if (perfil?.rol !== 'superadmin')
            return NextResponse.json({ error: 'Solo superadmin' }, { status: 403 })

        const body = await req.json()
        const { nombre, apellidos, email, password, empresa_id, rol = 'admin' } = body

        if (!email || !password || !nombre)
            return NextResponse.json({ error: 'nombre, email y password son obligatorios.' }, { status: 400 })

        const supabaseAdmin = getAdminClient()
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nombre, apellidos },
        })

        if (authError) throw authError

        const { error: profileError } = await supabaseAdmin
            .from('perfiles')
            .update({ nombre, apellidos, rol, empresa_id: empresa_id || null })
            .eq('id', authData.user.id)

        if (profileError) throw profileError

        return NextResponse.json({ data: authData.user }, { status: 201 })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

// ── PATCH: actualizar datos del admin ────────────────────────
export async function PATCH(req: Request) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { data: perfil } = await supabase
            .from('perfiles').select('rol').eq('id', user.id).single()
        if (perfil?.rol !== 'superadmin')
            return NextResponse.json({ error: 'Solo superadmin' }, { status: 403 })

        const { id, nombre, apellidos, empresa_id, rol } = await req.json()
        if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

        const { error } = await getAdminClient()
            .from('perfiles')
            .update({ nombre, apellidos, empresa_id: empresa_id || null, rol })
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

// ── DELETE: eliminar usuario ─────────────────────────────────
export async function DELETE(req: Request) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { data: perfil } = await supabase
            .from('perfiles').select('rol').eq('id', user.id).single()
        if (perfil?.rol !== 'superadmin')
            return NextResponse.json({ error: 'Solo superadmin' }, { status: 403 })

        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
        if (id === user.id) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo.' }, { status: 400 })

        const { error } = await getAdminClient().auth.admin.deleteUser(id)
        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}
