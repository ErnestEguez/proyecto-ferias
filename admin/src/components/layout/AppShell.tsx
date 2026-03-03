'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

type Role = 'superadmin' | 'admin' | 'expositor' | 'visitante'

interface AppShellProps {
    children: React.ReactNode
    role: Role
    userName: string
    userEmail: string
    pageTitle: string
    onSignOut: () => void
}

export default function AppShell({
    children,
    role,
    userName,
    userEmail,
    pageTitle,
    onSignOut,
}: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#06060a] overflow-hidden">
            {/* Sidebar desktop */}
            <div className="hidden lg:flex shrink-0">
                <Sidebar
                    role={role}
                    userName={userName}
                    userEmail={userEmail}
                    onSignOut={onSignOut}
                />
            </div>

            {/* Sidebar móvil (overlay) */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative z-50 flex shrink-0">
                        <Sidebar
                            role={role}
                            userName={userName}
                            userEmail={userEmail}
                            onSignOut={onSignOut}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    title={pageTitle}
                    onMenuToggle={() => setSidebarOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
