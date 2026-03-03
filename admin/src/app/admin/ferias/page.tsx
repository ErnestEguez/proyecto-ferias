'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { CalendarDays, Plus, Search, Pencil, Trash2, X, Save, Loader2, MoreHorizontal } from 'lucide-react'

interface Feria {
    id: string
    nombre: string
    codigo: string
    descripcion: string
    fecha_inicio_registro: string
    fecha_inicio: string
    fecha_fin: string
    ubicacion: string
    estado: string
}

const EMPTY = { nombre: '', codigo: '', descripcion: '', fecha_inicio_registro: '', fecha_inicio: '', fecha_fin: '', ubicacion: '', estado: 'borrador' }

export default function FeriasPage() {
    const supabase = createClient()
    const [ferias, setFerias] = useState<Feria[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState<string | null>(null)
    const [empresaId, setEmpresaId] = useState<string | null>(null)

    const fetch = async () => {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: p } = await supabase.from('perfiles').select('empresa_id').eq('id', session.user.id).single()
        setEmpresaId(p?.empresa_id || null)
        if (!p?.empresa_id) { setLoading(false); return }
        const { data } = await supabase.from('ferias').select('*').eq('empresa_id', p.empresa_id).order('created_at', { ascending: false })
        setFerias(data || [])
        setLoading(false)
    }
    useEffect(() => { fetch() }, [])

    const openNew = () => { setForm(EMPTY); setEditId(null); setError(null); setShowModal(true) }
    const openEdit = (f: Feria) => {
        setForm({ nombre: f.nombre, codigo: f.codigo || '', descripcion: f.descripcion || '', fecha_inicio_registro: f.fecha_inicio_registro || '', fecha_inicio: f.fecha_inicio || '', fecha_fin: f.fecha_fin || '', ubicacion: f.ubicacion || '', estado: f.estado || 'borrador' })
        setEditId(f.id); setError(null); setShowModal(true); setMenuOpen(null)
    }

    const save = async () => {
        if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
        setSaving(true); setError(null)
        const payload = { ...form, empresa_id: empresaId }
        const { error: e } = editId
            ? await supabase.from('ferias').update(payload).eq('id', editId)
            : await supabase.from('ferias').insert(payload)
        if (e) { setError(e.message); setSaving(false); return }
        setShowModal(false); fetch(); setSaving(false)
    }

    const del = async (id: string) => {
        if (!confirm('¿Eliminar esta feria? Se borrarán todos sus expositores y stands.')) return
        await supabase.from('ferias').delete().eq('id', id)
        setFerias(p => p.filter(f => f.id !== id)); setMenuOpen(null)
    }

    const estadoColor: Record<string, string> = {
        borrador: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        activo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        finalizado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    }

    const filtered = ferias.filter(f =>
        f.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        f.ubicacion?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar feria..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all">
                    <Plus className="w-4 h-4" /> Nueva Feria
                </button>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-400" /> Ferias ({filtered.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                ) : !empresaId ? (
                    <div className="p-10 text-center text-slate-500 text-sm">Tu usuario no tiene empresa asignada. Contacta al SuperAdmin.</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No hay ferias aún</p>
                        <button onClick={openNew} className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5 inline mr-1.5" />Crear feria
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-px bg-white/5">
                        {filtered.map(f => (
                            <div key={f.id} className="bg-[#06060a] px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <CalendarDays className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{f.nombre}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {f.fecha_inicio ? new Date(f.fecha_inicio).toLocaleDateString('es-EC') : 'Sin fecha'} · {f.ubicacion || 'Sin ubicación'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border hidden sm:inline-flex ${estadoColor[f.estado] || estadoColor.borrador}`}>
                                        {f.estado}
                                    </span>
                                    <div className="relative">
                                        <button onClick={() => setMenuOpen(menuOpen === f.id ? null : f.id)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        {menuOpen === f.id && (
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                                                <button onClick={() => openEdit(f)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
                                                    <Pencil className="w-3.5 h-3.5" /> Editar
                                                </button>
                                                <button onClick={() => del(f.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/5 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white">{editId ? 'Editar Feria' : 'Nueva Feria'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {error && <p className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}
                            {[
                                { label: 'Nombre *', key: 'nombre', placeholder: 'Feria Internacional 2026' },
                                { label: 'Código', key: 'codigo', placeholder: 'FI-2026-01' },
                                { label: 'Ubicación', key: 'ubicacion', placeholder: 'Centro de Convenciones, Quito' },
                                { label: 'Descripción', key: 'descripcion', placeholder: 'Descripcion de la feria...' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">{field.label}</label>
                                    <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                                </div>
                            ))}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[{ label: 'Apertura registro', key: 'fecha_inicio_registro' }, { label: 'Inicio', key: 'fecha_inicio' }, { label: 'Fin', key: 'fecha_fin' }].map(f => (
                                    <div key={f.key}>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">{f.label}</label>
                                        <input type="date" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Estado</label>
                                <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                    <option value="borrador">Borrador</option>
                                    <option value="activo">Activo</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-5 border-t border-white/5 flex gap-3 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">Cancelar</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Guardar' : 'Crear feria'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

