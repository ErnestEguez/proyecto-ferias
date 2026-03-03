'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const load = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push('/login'); return }

            const { data } = await supabase
                .from('perfiles')
                .select('nombre, apellidos, email, rol')
                .eq('id', session.user.id)
                .single()

            if (!data || !['admin', 'superadmin'].includes(data.rol)) {
                router.push('/dashboard')
                return
            }
            setProfile(data)
            setLoading(false)
        }
        load()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <AppShell
            role={profile?.rol}
            userName={profile?.nombre || 'Admin'}
            userEmail={profile?.email || ''}
            pageTitle="Panel Administrador de Feria"
            onSignOut={handleSignOut}
        >
            {children}
        </AppShell>
    )
}
