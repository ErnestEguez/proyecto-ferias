import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Globe, Users, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Circles Pattern (from user image reference) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="grid grid-cols-12 gap-8 p-10">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Plataforma Integral 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 hero-gradient-text leading-tight tracking-tighter transition-all">
            La Nueva Era de la <br /> <span className="text-primary italic">Gestión Ferial</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
            Proyecto Ferias es la solución SaaS definitiva para organizadores, expositores y visitantes. 
            Maneja todo tu evento en tiempo real desde una sola plataforma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link href="/register" className="btn-saas-primary h-14 px-10 flex items-center gap-3 text-lg group">
              Empezar Ahora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/nosotros" className="text-slate-300 hover:text-white font-bold flex items-center gap-2 transition-colors">
              Ver Demo Interactiva
            </Link>
          </div>

          {/* Feature Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: <Globe />, title: "Gestión Global", desc: "Maneja múltiples ferias y eventos simultáneamente." },
              { icon: <Users />, title: "Roles Definidos", desc: "SuperAdmin, Admin, Expositor y Visitante con accesos seguros." },
              { icon: <BarChart3 />, title: "Big Data & Leads", desc: "Captura de contactos y analíticas avanzadas en tiempo real." }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl text-left hover:bg-white/[0.08] transition-all group">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Benefits Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl float-animation">
            <Image 
              src="/auth_illustration.png" 
              alt="Dashboard Preview" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/20" />
          </div>

          <div className="space-y-8 text-left">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Diseñado para <span className="text-primary italic underline underline-offset-8">Cada Tipo de Usuario</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Damos a cada participante las herramientas exactas que necesita para que su experiencia sea un éxito rotundo.
            </p>

            <div className="space-y-4">
              {[
                { t: "SuperAdmin", d: "Visión global y control de empresas organizadoras." },
                { t: "Administrador de Feria", d: "Control total de stands, mapas y expositores." },
                { t: "Expositor", d: "Captura de leads, catálogo digital y métricas de stand." },
                { t: "Visitante", d: "QR inteligente, mapa interactivo y favoritos." }
              ].map((role, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-bold text-slate-900">{role.t}</h4>
                    <p className="text-slate-500 text-sm">{role.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 opacity-60">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-xs">PF</div>
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Proyecto Ferias 2026</span>
        </div>
        <p className="text-slate-500 text-xs font-medium">© 2026 Billennium Web. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
