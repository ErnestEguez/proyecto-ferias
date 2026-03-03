'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, ShieldCheck, Briefcase, Globe, Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    setSchemaError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Intentamos obtener el perfil, pero manejamos el error de esquema elegantemente
      const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id);

      if (profileError) {
        console.error('Error de esquema detectable:', profileError);
        setSchemaError(profileError.message);
        // Fallback: Creamos un perfil temporal basado en el correo
        setProfile({
          nombre: session.user.email?.split('@')[0],
          rol: session.user.email === 'facturacion@billenniumsystem.com' ? 'superadmin' : 'visitante'
        });
      } else {
        setProfile(profileData?.[0] || {
          nombre: session.user.email?.split('@')[0],
          rol: session.user.email === 'facturacion@billenniumsystem.com' ? 'superadmin' : 'visitante'
        });
      }
    } catch (err: any) {
      console.error('Error crítico en Dashboard:', err);
      setSchemaError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Iniciando Sesión Segura...</p>
      </div>
    );
  }

  const roleLabels: Record<string, { label: string, icon: any, color: string }> = {
    superadmin: { label: 'Super Administrador', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    admin: { label: 'Administrador de Empresa', icon: <Briefcase className="w-5 h-5" />, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    expositor: { label: 'Expositor', icon: <Globe className="w-5 h-5" />, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
    visitante: { label: 'Visitante (Público)', icon: <User className="w-5 h-5" />, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  };

  const currentRole = profile?.rol ? roleLabels[profile.rol] : roleLabels['visitante'];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-2 hero-gradient-text uppercase">
              Proyecto Ferias
            </h1>
            <p className="text-slate-400 font-medium">Arquitectura SaaS Multi-Empresa</p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </header>

        {schemaError && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-400/5 border border-amber-500/20 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-amber-500 font-bold mb-1">Aviso de Sincronización</h3>
              <p className="text-slate-400 text-sm">
                La base de datos está respondiendo con un error de esquema. Puedes navegar, pero algunas funciones avanzadas podrían no estar disponibles momentáneamente.
              </p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase tracking-tighter">Detalle: {schemaError}</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="auth-saas-card bg-white/[0.03] border-white/5 p-8 h-fit">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{profile?.nombre}</h3>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${currentRole.color} mb-6 w-full justify-center`}>
              {currentRole.icon}
              <span className="text-xs font-black uppercase tracking-widest">{currentRole.label}</span>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Estado:</span>
                <span className="text-green-400">Autenticado</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-primary/10">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-black mb-4 italic uppercase text-primary tracking-tighter">Bienvenido al Centro de Control</h3>
              <p className="text-slate-400 leading-relaxed mb-8 max-w-lg">
                Has ingresado exitosamente al sistema. {profile?.rol === 'superadmin'
                  ? 'Como Super Administrador, tienes el control de todas las empresas y ferias globales.'
                  : 'Estamos configurando tu perfil para que puedas gestionar tus eventos.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={profile?.rol === 'superadmin' ? '/superadmin' : '/admin'}
                  className="btn-saas-primary px-8 h-12 flex items-center"
                >
                  Gestionar Contenido
                </Link>
                <Link
                  href={profile?.rol === 'superadmin' ? '/superadmin' : '/admin'}
                  className="px-8 h-12 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all flex items-center"
                >
                  Ver Panel
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Módulos Activos</h4>
                <p className="text-2xl font-black italic">CONFIGURANDO</p>
              </div>
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Seguridad LOPDP</h4>
                <p className="text-2xl font-black italic text-green-400 underline decoration-green-500/20 underline-offset-4">VERIFICADA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
