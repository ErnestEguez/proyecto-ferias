'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth-code-error') {
      setError('Hubo un error al confirmar tu correo. El enlace podría haber expirado.');
    }
  }, [searchParams]);

  const resendConfirmation = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico primero.');
      return;
    }
    setResending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (resendError) throw resendError;
      setMessage('Un nuevo enlace de confirmación ha sido enviado a tu correo.');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el correo.');
    } finally {
      setResending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent, isDemo = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        router.push('/dashboard');
        return;
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o SPAM.');
        } else {
          throw authError;
        }
        return;
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error de login:', err);
      setError(err.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => handleLogin(e)}>
      <div className="space-y-2 text-left">
        <label className="label-saas">Email Corporativo</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-saas pl-11"
            placeholder="facturacion@billenniumsystem.com"
          />
        </div>
      </div>

      <div className="space-y-2 text-left">
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

      {message && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-400/5 border border-green-500/20 text-green-400 text-xs animate-fade-in text-left">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-400/5 border border-red-500/20 text-red-400 text-xs animate-fade-in text-left">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
          {error.includes('aún no ha sido confirmado') && (
            <button
              type="button"
              onClick={resendConfirmation}
              disabled={resending}
              className="text-primary hover:underline font-bold uppercase tracking-widest text-[10px] self-start"
            >
              {resending ? 'Enviando...' : 'Re-enviar correo de confirmación'}
            </button>
          )}
        </div>
      )}

      <div className="flex justify-start">
        <button type="button" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className="space-y-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-saas-primary w-full h-12 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Acceder al Sistema</span>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => handleLogin(e, true)}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 font-bold hover:text-primary transition-colors py-3 border border-dashed border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Explorar Modo Demo
        </button>
      </div>
    </form>
  );
}
