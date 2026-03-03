'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="landing-header sticky top-0 z-50 w-full px-6 md:px-20 py-4 flex items-center justify-between">
      {/* Branding / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">PF</div>
        <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">Proyecto Ferias</span>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-2">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>Inicio</Link>
        <Link href="/productos" className="nav-item">Productos</Link>
        <Link href="/nosotros" className="nav-item">Nosotros</Link>
        <Link href="/contacto" className="nav-item">Contacto</Link>
      </nav>

      {/* Auth Actions */}
      <div className="flex items-center gap-4">
        <Link href="/login" className="btn-saas-ghost hidden sm:block">Iniciar Sesión</Link>
        <Link href="/register" className="btn-saas-primary">Registrarse</Link>
      </div>
    </header>
  );
}
