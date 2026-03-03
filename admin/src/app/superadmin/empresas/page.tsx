export const dynamic = 'force-dynamic'

'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Building2, Plus, Search, MoreHorizontal, Pencil,
    Trash2, ToggleLeft, ToggleRight, X, Save, Loader2
} from 'lucide-react'

interface Empresa {
    id: string
    nombre: string
    ruc: string
    email: string
    telefono: string
    plan: string
    estado: string
    created_at: string
}

const EMPTY_FORM = { nombre: '', ruc: '', email: '', telefono: '', plan: 'basic', estado: 'activo' }

export default function EmpresasPage() {
    const supabase = createClient()
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState<string | null>(null)

    const fetchEmpresas = async () => {
        setLoading(true)
        const { data } = await supabase.from('empresas').select('*').order('created_at', { ascending: false })
        setEmpresas(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchEmpresas() }, [])

    const openNew = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setError(null)
        setShowModal(true)
    }

    const openEdit = (emp: Empresa) => {
        setForm({ nombre: emp.nombre, ruc: emp.ruc || '', email: emp.email || '', telefono: emp.telefono || '', plan: emp.plan || 'basic', estado: emp.estado || 'activo' })
        setEditId(emp.id)
        setError(null)
        setShowModal(true)
        setMenuOpen(null)
    }

    const handleSave = async () => {
        if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
        setSaving(true)
        setError(null)
        const payload = { nombre: form.nombre.trim(), ruc: form.ruc, email: form.email, telefono: form.telefono, plan: form.plan, estado: form.estado }
        const { error: dbErr } = editId
            ? await supabase.from('empresas').update(payload).eq('id', editId)
            : await supabase.from('empresas').insert(payload)

        if (dbErr) { setError(dbErr.message); setSaving(false); return }
        setShowModal(false)
        fetchEmpresas()
        setSaving(false)
    }

    const toggleEstado = async (emp: Empresa) => {
        const next = emp.estado === 'activo' ? 'inactivo' : 'activo'
        await supabase.from('empresas').update({ estado: next }).eq('id', emp.id)
        setEmpresas(prev => prev.map(e => e.id === emp.id ? { ...e, estado: next } : e))
        setMenuOpen(null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar esta empresa? Esta acción no se puede deshacer.')) return
        await supabase.from('empresas').delete().eq('id', id)
        setEmpresas(prev => prev.filter(e => e.id !== id))
        setMenuOpen(null)
    }

    const filtered = empresas.filter(e =>
        e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        e.ruc?.includes(search) ||
        e.email?.toLowerCase().includes(search)
    )

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar empresa..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                    />
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all"
                >
                    <Plus className="w-4 h-4" /> Nueva Empresa
                </button>
            </div>

            {/* Tabla */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        Empresas ({filtered.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No se encontraron empresas</p>
                        <button onClick={openNew} className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5 inline mr-1.5" />Crear empresa
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5">
                                    <th className="text-left px-5 py-3">Empresa</th>
                                    <th className="text-left px-4 py-3 hidden sm:table-cell">RUC</th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                                    <th className="text-left px-4 py-3">Plan</th>
                                    <th className="text-left px-4 py-3">Estado</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-white/[0.02] transition-all">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-black shrink-0">
                                                    {emp.nombre?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="font-bold text-white">{emp.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-400 hidden sm:table-cell">{emp.ruc || '—'}</td>
                                        <td className="px-4 py-4 text-slate-400 hidden md:table-cell">{emp.email || '—'}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                {emp.plan || 'basic'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${emp.estado === 'activo'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {emp.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 relative">
                                            <button
                                                onClick={() => setMenuOpen(menuOpen === emp.id ? null : emp.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            {menuOpen === emp.id && (
                                                <div className="absolute right-4 top-full mt-1 w-44 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                                                    <button onClick={() => openEdit(emp)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
                                                        <Pencil className="w-3.5 h-3.5" /> Editar
                                                    </button>
                                                    <button onClick={() => toggleEstado(emp)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
                                                        {emp.estado === 'activo' ? <><ToggleLeft className="w-3.5 h-3.5" /> Desactivar</> : <><ToggleRight className="w-3.5 h-3.5 text-emerald-400" /> Activar</>}
                                                    </button>
                                                    <button onClick={() => handleDelete(emp.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/5 transition-all">
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

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white">{editId ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <p className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}
                            {[
                                { label: 'Nombre de la empresa *', key: 'nombre', placeholder: 'Ej: Corporación XYZ' },
                                { label: 'RUC', key: 'ruc', placeholder: '0990000000001' },
                                { label: 'Email', key: 'email', placeholder: 'info@empresa.com' },
                                { label: 'Teléfono', key: 'telefono', placeholder: '+593 99 000 0000' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">{field.label}</label>
                                    <input
                                        value={(form as any)[field.key]}
                                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Plan</label>
                                    <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Estado</label>
                                    <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-white/5 flex gap-3 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">
                                Cancelar
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Guardar cambios' : 'Crear empresa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

