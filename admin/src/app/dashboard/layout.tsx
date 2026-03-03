export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0b] flex">
            {/* Sidebar Skeleton */}
            <aside className="w-64 border-r border-white/5 p-6 space-y-8 flex flex-col">
                <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    Feria Admin
                </div>

                <nav className="flex-1 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                </nav>

                <div className="h-12 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-bottom border-white/5 px-8 flex items-center justify-between">
                    <div className="h-6 w-48 rounded bg-white/5 animate-pulse" />
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                    </div>
                </header>

                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
