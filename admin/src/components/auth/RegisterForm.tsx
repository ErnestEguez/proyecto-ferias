'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, User, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      // Registration is strictly for 'visitante' role by default in our handle_new_user trigger
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
            // The trigger public.handle_new_user handles the role assignment
          },
        },
      });

      if (authError) throw authError;
      
      alert('¡Bienvenido! Tu cuenta de Visitante ha sido creada. Por favor, verifica tu correo electrónico (revisa también SPAM).');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6 text-left">
      <div className="space-y-2">
        <label className="label-saas">Nombre del Visitante</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-saas pl-11"
            placeholder="Ej. Juan Pérez"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label-saas">Correo Personal</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-saas pl-11"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="label-saas">Contraseña</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-saas pl-11"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label-saas">Confirmar</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-saas pl-11"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-400/5 border border-red-500/20 text-red-400 text-xs animate-fade-in text-left">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-saas-primary w-full h-12 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Registrarse como Visitante</span>
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed font-bold uppercase tracking-widest">
        Al registrarte obtendrás tu <span className="text-primary italic">Credencial Digital QR</span> para acceder a la feria.
      </p>
    </form>
  );
}
