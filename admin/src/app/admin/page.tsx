'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { CalendarDays, Store, Users, Map, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
    const [stats, setStats] = useState({ ferias: 0, expositores: 0, visitantes: 0, stands: 0 })
    const [ferias, setFerias] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const load = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data: perfilData } = await supabase.from('perfiles').select('empresa_id').eq('id', session.user.id).single()
            const empId = perfilData?.empresa_id

            if (!empId) return

            const [feriasRes, expRes, visRes, standRes] = await Promise.all([
                supabase.from('ferias').select('*').eq('empresa_id', empId).order('created_at', { ascending: false }),
                supabase.from('expositores').select('*', { count: 'exact', head: true }).eq('empresa_id', empId),
                supabase.from('visitantes').select('...ferias!inner(empresa_id)', { count: 'exact', head: true }),
                supabase.from('stands').select('*', { count: 'exact', head: true }).eq('empresa_id', empId),
            ])

            setFerias(feriasRes.data || [])
            setStats({
                ferias: feriasRes.data?.length || 0,
                expositores: expRes.count || 0,
                visitantes: visRes.count || 0,
                stands: standRes.count || 0,
            })
        }
        load()
    }, [])

    const statCards = [
        { label: 'Ferias', value: stats.ferias, icon: <CalendarDays className="w-5 h-5" />, color: 'text-blue-400 bg-blue-400/10 border-blue-400/15', href: '/admin/ferias' },
        { label: 'Expositores', value: stats.expositores, icon: <Store className="w-5 h-5" />, color: 'text-purple-400 bg-purple-400/10 border-purple-400/15', href: '/admin/expositores' },
        { label: 'Visitantes', value: stats.visitantes, icon: <Users className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/15', href: '/admin/visitantes' },
        { label: 'Stands', value: stats.stands, icon: <Map className="w-5 h-5" />, color: 'text-amber-400 bg-amber-400/10 border-amber-400/15', href: '/admin/stands' },
    ]

    const estadoColor: Record<string, string> = {
        borrador: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        activo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        finalizado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/15 p-6">
                <h2 className="text-xl font-black text-white mb-1">Panel de Administración</h2>
                <p className="text-slate-400 text-sm">Gestiona tus ferias, expositores y visitantes desde aquí.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <Link key={card.label} href={card.href}
                        className="group rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:border-white/10 transition-all hover:bg-white/[0.05]">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${card.color}`}>{card.icon}</div>
                        <p className="text-2xl font-black text-white">{card.value}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
                    </Link>
                ))}
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Mis Ferias</h3>
                    <Link href="/admin/ferias" className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        Ver todas <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {ferias.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">Aún no hay ferias creadas</p>
                        <Link href="/admin/ferias?new=true"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5" /> Crear primera feria
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {ferias.slice(0, 5).map(feria => (
                            <Link key={feria.id} href={`/admin/ferias/${feria.id}`}
                                className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-all">
                                <div>
                                    <p className="text-sm font-bold text-white">{feria.nombre}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {feria.fecha_inicio ? new Date(feria.fecha_inicio).toLocaleDateString('es-EC') : 'Sin fecha'} —{' '}
                                        {feria.ubicacion || 'Sin ubicación'}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${estadoColor[feria.estado] || estadoColor.borrador}`}>
                                    {feria.estado}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

