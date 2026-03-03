'use client'

import { useEffect, useState } from 'react'
import {
    Users, Plus, Search, Pencil, Trash2, X, Save,
    Loader2, MoreHorizontal, ShieldCheck, Briefcase, Eye, EyeOff
} from 'lucide-react'

interface AdminUser {
    id: string
    nombre: string
    apellidos: string
    email: string
    rol: string
    empresa_id: string | null
    created_at: string
    empresas?: { id: string; nombre: string } | null
}

interface Empresa { id: string; nombre: string }

const EMPTY_FORM = {
    nombre: '', apellidos: '', email: '', password: '',
    empresa_id: '', rol: 'admin'
}

const ROL_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    superadmin: { label: 'Super Admin', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <ShieldCheck className="w-3 h-3" /> },
    admin: { label: 'Admin Feria', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <Briefcase className="w-3 h-3" /> },
}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<AdminUser[]>([])
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState<string | null>(null)
    const [showPass, setShowPass] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        const [usersRes, empRes] = await Promise.all([
            fetch('/api/usuarios'),
            fetch('/api/empresas'),
        ])
        const usersJson = await usersRes.json()
        const empJson = await empRes.json()
        setUsuarios(usersJson.data || [])
        setEmpresas(empJson.data || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const openNew = () => {
        setForm(EMPTY_FORM); setEditId(null); setError(null)
        setShowPass(false); setShowModal(true)
    }

    const openEdit = (u: AdminUser) => {
        setForm({ nombre: u.nombre || '', apellidos: u.apellidos || '', email: u.email, password: '', empresa_id: u.empresa_id || '', rol: u.rol })
        setEditId(u.id); setError(null); setShowPass(false); setShowModal(true); setMenuOpen(null)
    }

    const handleSave = async () => {
        if (!form.nombre.trim() || !form.email.trim()) { setError('Nombre y email son obligatorios.'); return }
        if (!editId && form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }

        setSaving(true); setError(null)

        const res = await fetch('/api/usuarios', {
            method: editId ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editId ? { id: editId, ...form } : form),
        })
        const json = await res.json()

        if (!res.ok) { setError(json.error || 'Error desconocido'); setSaving(false); return }
        setShowModal(false); fetchData(); setSaving(false)
    }

    const handleDelete = async (id: string) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        const res = await fetch('/api/usuarios', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: deleteId }),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.error); return }
        setUsuarios(p => p.filter(u => u.id !== deleteId))
        setDeleteId(null); setMenuOpen(null)
    }

    const filtered = usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.empresas?.nombre?.toLowerCase().includes(search.toLowerCase())
    )

    const fields = [
        { label: 'Nombre *', key: 'nombre', placeholder: 'Juan', type: 'text' },
        { label: 'Apellidos', key: 'apellidos', placeholder: 'Pérez García', type: 'text' },
        { label: 'Email *', key: 'email', placeholder: 'admin@empresa.com', type: 'email' },
    ]

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar administrador..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all">
                    <Plus className="w-4 h-4" /> Nuevo Administrador
                </button>
            </div>

            {/* Tabla */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Administradores ({filtered.length})</h3>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No hay administradores aún</p>
                        <button onClick={openNew} className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                            <Plus className="w-3.5 h-3.5 inline mr-1.5" />Crear administrador
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5">
                                    <th className="text-left px-5 py-3">Usuario</th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">Empresa</th>
                                    <th className="text-left px-4 py-3">Rol</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(u => {
                                    const rolCfg = ROL_CONFIG[u.rol] || ROL_CONFIG.admin
                                    return (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-all">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-black shrink-0">
                                                        {u.nombre?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{u.nombre} {u.apellidos}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-400 hidden md:table-cell">
                                                {u.empresas?.nombre || <span className="text-slate-600 italic">Sin empresa</span>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${rolCfg.color}`}>
                                                    {rolCfg.icon}{rolCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 relative">
                                                <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                {menuOpen === u.id && (
                                                    <div className="absolute right-4 top-full mt-1 w-44 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                                                        <button onClick={() => openEdit(u)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all">
                                                            <Pencil className="w-3.5 h-3.5" /> Editar datos
                                                        </button>
                                                        <button onClick={() => handleDelete(u.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/5 transition-all">
                                                            <Trash2 className="w-3.5 h-3.5" /> Eliminar usuario
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white">{editId ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {error && <p className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}

                            {fields.map(f => (
                                <div key={f.key}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">{f.label}</label>
                                    <input
                                        type={f.type}
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder}
                                        disabled={f.key === 'email' && !!editId} // email no editable al editar
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-40"
                                    />
                                </div>
                            ))}

                            {/* Contraseña solo al crear */}
                            {!editId && (
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Contraseña *</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                            placeholder="Mínimo 8 caracteres"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Empresa */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Empresa asignada</label>
                                <select value={form.empresa_id} onChange={e => setForm(p => ({ ...p, empresa_id: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                    <option value="">Sin empresa (SuperAdmin solo)</option>
                                    {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </div>

                            {/* Rol */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Rol</label>
                                <select value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                    <option value="admin">Admin Feria</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-5 border-t border-white/5 flex gap-3 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">Cancelar</button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Guardar cambios' : 'Crear administrador'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal confirmación eliminar */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-[#0d0d1a] border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-white mb-2">¿Eliminar usuario?</h3>
                        <p className="text-xs text-slate-400 mb-6">Esta acción eliminará el acceso del administrador de forma permanente.</p>
                        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
                        <div className="flex gap-3">
                            <button onClick={() => { setDeleteId(null); setMenuOpen(null) }}
                                className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">Cancelar</button>
                            <button onClick={confirmDelete}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
