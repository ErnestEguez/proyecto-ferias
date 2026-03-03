'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Navbar from '@/components/layout/Navbar';
import { UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-[560px] animate-fade-in">
          {/* Back btn */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>

          <div className="auth-saas-card">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6">
                <UserPlus className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight italic">Únete a Proyecto Ferias</h1>
              <p className="text-slate-400 text-sm font-medium">Digitaliza tu experiencia ferial hoy mismo.</p>
            </div>

            <RegisterForm />

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <p className="text-xs font-bold text-center text-slate-500 uppercase tracking-widest">¿Ya tienes una cuenta registrada?</p>
              <Link href="/login" className="w-full flex items-center justify-center h-12 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all">
                Inicia sesión en tu cuenta
              </Link>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Security</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Professional Edition 2026</span>
          </div>
        </div>
      </main>
    </div>
  );
}
