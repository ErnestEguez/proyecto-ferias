'use client'

import { Bell, Search, Menu } from 'lucide-react'

interface HeaderProps {
    title: string
    onMenuToggle?: () => void
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
    return (
        <header className="h-14 bg-[#0a0a0f] border-b border-white/5 px-5 flex items-center gap-4 shrink-0">
            {/* Botón hamburguesa (móvil) */}
            {onMenuToggle && (
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* Título de la página */}
            <h2 className="text-sm font-bold text-white flex-1">{title}</h2>

            {/* Acciones del header */}
            <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                    <Search className="w-4 h-4" />
                </button>
                <button className="relative p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </button>
            </div>
        </header>
    )
}
