'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Building2, Users, CalendarDays,
    Store, Map, BarChart3, MessageSquare, Bell,
    ChevronRight, ShieldCheck, Briefcase, LogOut, X
} from 'lucide-react'

type Role = 'superadmin' | 'admin' | 'expositor' | 'visitante'

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
    roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
    // SuperAdmin
    {
        label: 'Panel Global',
        href: '/superadmin',
        icon: <ShieldCheck className="w-4 h-4" />,
        roles: ['superadmin'],
    },
    {
        label: 'Empresas',
        href: '/superadmin/empresas',
        icon: <Building2 className="w-4 h-4" />,
        roles: ['superadmin'],
    },
    {
        label: 'Administradores',
        href: '/superadmin/usuarios',
        icon: <Users className="w-4 h-4" />,
        roles: ['superadmin'],
    },
    // Admin Feria
    {
        label: 'Dashboard',
        href: '/admin',
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Mis Ferias',
        href: '/admin/ferias',
        icon: <CalendarDays className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Expositores',
        href: '/admin/expositores',
        icon: <Store className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Stands & Plano',
        href: '/admin/stands',
        icon: <Map className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Visitantes',
        href: '/admin/visitantes',
        icon: <Users className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Eventos',
        href: '/admin/eventos',
        icon: <CalendarDays className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Reportes',
        href: '/admin/reportes',
        icon: <BarChart3 className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Notificaciones',
        href: '/admin/notificaciones',
        icon: <Bell className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        label: 'Chats',
        href: '/admin/chats',
        icon: <MessageSquare className="w-4 h-4" />,
        roles: ['admin'],
    },
]

const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
    superadmin: {
        label: 'Super Admin',
        color: 'text-red-400 bg-red-400/10 border-red-400/20',
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    admin: {
        label: 'Admin Feria',
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    expositor: {
        label: 'Expositor',
        color: 'text-green-400 bg-green-400/10 border-green-400/20',
        icon: <Store className="w-3.5 h-3.5" />,
    },
    visitante: {
        label: 'Visitante',
        color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
        icon: <Users className="w-3.5 h-3.5" />,
    },
}

interface SidebarProps {
    role: Role
    userName: string
    userEmail: string
    onSignOut: () => void
    onClose?: () => void
}

export default function Sidebar({ role, userName, userEmail, onSignOut, onClose }: SidebarProps) {
    const pathname = usePathname()
    const roleConfig = ROLE_CONFIG[role]
    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role))

    return (
        <aside className="w-64 h-full flex flex-col bg-[#0a0a0f] border-r border-white/5">
            {/* Header del sidebar */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Proyecto</p>
                    <h1 className="text-lg font-black text-white leading-tight">Ferias<span className="text-blue-500">.</span></h1>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Badge de rol */}
            <div className="px-4 pt-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-black uppercase tracking-widest ${roleConfig.color}`}>
                    {roleConfig.icon}
                    {roleConfig.label}
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/superadmin' && item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}>
                                {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer con usuario */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-black shrink-0">
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{userName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                    </div>
                </div>
                <button
                    onClick={onSignOut}
                    className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}
