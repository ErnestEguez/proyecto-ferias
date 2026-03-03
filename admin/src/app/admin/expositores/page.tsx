'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Plus, Search, Pencil, Trash2, X, Save, Loader2, MoreHorizontal } from 'lucide-react'

interface Expositor {
    id: string; nombre_comercial: string; ruc: string; responsable: string
    movil: string; email: string; rubro: string; ciudad: string; pais: string; feria_id: string
}

const EMPTY = { nombre_comercial: '', ruc: '', responsable: '', movil: '', email: '', rubro: '', ciudad: '', pais: 'Ecuador', descripcion: '', observaciones: '', feria_id: '' }

export default function ExpositoresPage() {
    const supabase = createClient()
    const [expositores, setExpositores] = useState<Expositor[]>([])
    const [ferias, setFerias] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [feriaFilter, setFeriaFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState<string | null>(null)
    const [empresaId, setEmpresaId] = useState<string | null>(null)

    const load = async () => {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: p } = await supabase.from('perfiles').select('empresa_id').eq('id', session.user.id).single()
        const eid = p?.empresa_id
        setEmpresaId(eid)
        if (!eid) { setLoading(false); return }
        const [expRes, feriaRes] = await Promise.all([
            supabase.from('expositores').select('*').eq('empresa_id', eid).order('nombre_comercial'),
            supabase.from('ferias').select('id, nombre').eq('empresa_id', eid).order('nombre'),
        ])
        setExpositores(expRes.data || [])
        setFerias(feriaRes.data || [])
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    const openNew = () => { setForm({ ...EMPTY, feria_id: ferias[0]?.id || '' }); setEditId(null); setError(null); setShowModal(true) }
    const openEdit = (e: Expositor) => {
        setForm({ nombre_comercial: e.nombre_comercial, ruc: e.ruc || '', responsable: e.responsable || '', movil: e.movil || '', email: e.email || '', rubro: e.rubro || '', ciudad: e.ciudad || '', pais: e.pais || 'Ecuador', descripcion: '', observaciones: '', feria_id: e.feria_id })
        setEditId(e.id); setError(null); setShowModal(true); setMenuOpen(null)
    }

    const save = async () => {
        if (!form.nombre_comercial.trim()) { setError('El nombre comercial es obligatorio.'); return }
        if (!form.feria_id) { setError('Selecciona una feria.'); return }
        setSaving(true); setError(null)
        const payload = { ...form, empresa_id: empresaId }
        const { error: e } = editId
            ? await supabase.from('expositores').update(payload).eq('id', editId)
            : await supabase.from('expositores').insert(payload)
        if (e) { setError(e.message); setSaving(false); return }
        setShowModal(false); load(); setSaving(false)
    }

    const del = async (id: string) => {
        if (!confirm('¿Eliminar este expositor?')) return
        await supabase.from('expositores').delete().eq('id', id)
        setExpositores(p => p.filter(e => e.id !== id)); setMenuOpen(null)
    }

    const filtered = expositores.filter(e =>
        (e.nombre_comercial?.toLowerCase().includes(search.toLowerCase()) || e.rubro?.toLowerCase().includes(search.toLowerCase())) &&
        (!feriaFilter || e.feria_id === feriaFilter)
    )

    const fields = [
        { label: 'Nombre Comercial *', key: 'nombre_comercial', placeholder: 'Mi Empresa S.A.' },
        { label: 'RUC', key: 'ruc', placeholder: '0990000000001' },
        { label: 'Responsable', key: 'responsable', placeholder: 'Juan Pérez' },
        { label: 'Móvil', key: 'movil', placeholder: '+593 99 000 0000' },
        { label: 'Email', key: 'email', placeholder: 'contacto@empresa.com' },
        { label: 'Rubro', key: 'rubro', placeholder: 'Tecnología, Alimentos...' },
        { label: 'Ciudad', key: 'ciudad', placeholder: 'Quito' },
        { label: 'País', key: 'pais', placeholder: 'Ecuador' },
    ]

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar expositor..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <select value={feriaFilter} onChange={e => setFeriaFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                        <option value="">Todas las ferias</option>
                        {ferias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shrink-0">
                    <Plus className="w-4 h-4" /> Nuevo Expositor
                </button>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Store className="w-4 h-4 text-blue-400" /> Expositores ({filtered.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                ) : ferias.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 text-sm">Crea primero una feria antes de agregar expositores.</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Store className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No hay expositores aún</p>
                        <button onClick={openNew} className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5 inline mr-1.5" />Agregar expositor
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5">
                                    <th className="text-left px-5 py-3">Expositor</th>
                                    <th className="text-left px-4 py-3 hidden sm:table-cell">Rubro</th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">Responsable</th>
                                    <th className="text-left px-4 py-3 hidden lg:table-cell">Contacto</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(exp => (
                                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-all">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-xs font-black shrink-0">
                                                    {exp.nombre_comercial?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{exp.nombre_comercial}</p>
                                                    <p className="text-xs text-slate-500">{exp.ruc || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-400 hidden sm:table-cell">{exp.rubro || '—'}</td>
                                        <td className="px-4 py-4 text-slate-400 hidden md:table-cell">{exp.responsable || '—'}</td>
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <p className="text-slate-400 text-xs">{exp.email || '—'}</p>
                                            <p className="text-slate-500 text-xs">{exp.movil || ''}</p>
                                        </td>
                                        <td className="px-4 py-4 relative">
                                            <button onClick={() => setMenuOpen(menuOpen === exp.id ? null : exp.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            {menuOpen === exp.id && (
                                                <div className="absolute right-4 top-full mt-1 w-40 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                                                    <button onClick={() => openEdit(exp)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
                                                        <Pencil className="w-3.5 h-3.5" /> Editar
                                                    </button>
                                                    <button onClick={() => del(exp.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/5 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white">{editId ? 'Editar Expositor' : 'Nuevo Expositor'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[68vh] overflow-y-auto">
                            {error && <p className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Feria *</label>
                                <select value={form.feria_id} onChange={e => setForm(p => ({ ...p, feria_id: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                    <option value="">Seleccionar feria...</option>
                                    {ferias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fields.map(field => (
                                    <div key={field.key}>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">{field.label}</label>
                                        <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 border-t border-white/5 flex gap-3 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">Cancelar</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Guardar' : 'Crear expositor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
