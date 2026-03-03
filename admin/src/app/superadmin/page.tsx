'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Building2, Users, Globe, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminPage() {
    const [stats, setStats] = useState({ empresas: 0, admins: 0, ferias: 0 })
    const [empresas, setEmpresas] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const load = async () => {
            const { data: empresasData } = await supabase.from('empresas').select('*').order('created_at', { ascending: false }).limit(5)
            const { count: adminCount } = await supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('rol', 'admin')
            const { count: feriaCount } = await supabase.from('ferias').select('*', { count: 'exact', head: true })
            setEmpresas(empresasData || [])
            setStats({
                empresas: empresasData?.length || 0,
                admins: adminCount || 0,
                ferias: feriaCount || 0,
            })
        }
        load()
    }, [])

    const statCards = [
        { label: 'Empresas Activas', value: stats.empresas, icon: <Building2 className="w-5 h-5" />, color: 'text-blue-400 bg-blue-400/10 border-blue-400/15', href: '/superadmin/empresas' },
        { label: 'Administradores', value: stats.admins, icon: <Users className="w-5 h-5" />, color: 'text-purple-400 bg-purple-400/10 border-purple-400/15', href: '/superadmin/usuarios' },
        { label: 'Ferias en Sistema', value: stats.ferias, icon: <Globe className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/15', href: '/superadmin/empresas' },
        { label: 'Plataforma', value: 'v1.0 MVP', icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400 bg-amber-400/10 border-amber-400/15', href: '#' },
    ]

    return (
        <div className="space-y-6">
            {/* Bienvenida */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/15 p-6">
                <h2 className="text-xl font-black text-white mb-1">Panel Global de Control</h2>
                <p className="text-slate-400 text-sm">Gestiona todas las empresas y ferias del sistema desde aquí.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href}
                        className="group rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:border-white/10 transition-all hover:bg-white/[0.05]">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${card.color}`}>
                            {card.icon}
                        </div>
                        <p className="text-2xl font-black text-white">{card.value}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
                    </Link>
                ))}
            </div>

            {/* Últimas empresas */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Empresas Registradas</h3>
                    <Link href="/superadmin/empresas"
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        Ver todas <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {empresas.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm font-medium">Aún no hay empresas registradas</p>
                        <Link href="/superadmin/empresas?new=true"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5" /> Crear primera empresa
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {empresas.map((emp) => (
                            <div key={emp.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-black">
                                        {emp.nombre?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{emp.nombre}</p>
                                        <p className="text-xs text-slate-500">{emp.ruc || 'Sin RUC'} · Plan {emp.plan || 'basic'}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${emp.estado === 'activo'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {emp.estado || 'activo'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

