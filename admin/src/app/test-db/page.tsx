'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Shield, Database, Lock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function TestDBPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const runDiagnostics = async () => {
    setLoading(true);
    const tests: any[] = [];

    // Test 1: Basic Connection
    try {
      const { data, error } = await supabase.from('roles').select('count').limit(1);
      tests.push({
        name: 'Query Table public.roles',
        status: !error ? 'success' : 'error',
        message: error ? error.message : 'Detección de tabla exitosa.',
        details: error
      });
    } catch (e: any) {
      tests.push({ name: 'Query Table public.roles', status: 'error', message: e.message });
    }

    // Test 2: Profiles Table Access
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      tests.push({
        name: 'Query Table public.profiles',
        status: !error ? 'success' : 'error',
        message: error ? error.message : 'Detección de perfiles exitosa.',
        details: error
      });
    } catch (e: any) {
      tests.push({ name: 'Query Table public.profiles', status: 'error', message: e.message });
    }

    // Test 3: Auth Status
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      tests.push({
        name: 'Auth Session State',
        status: !error ? 'success' : 'error',
        message: session ? 'Sesión activa detectada.' : 'No hay sesión (Esperado si no has logueado).',
      });
    } catch (e: any) {
      tests.push({ name: 'Auth Session State', status: 'error', message: e.message });
    }

    setResults(tests);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-2 hero-gradient-text uppercase italic">Diagnóstico Maestro</h1>
        <p className="text-slate-500 mb-8 font-bold text-xs uppercase tracking-widest">Proyecto Ferias - Technical Health Check</p>

        <button 
          onClick={runDiagnostics}
          disabled={loading}
          className="btn-saas-primary w-full h-14 mb-12 flex items-center justify-center gap-3"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Shield className="w-5 h-5" />}
          <span>Ejecutar Diagnóstico de Base de Datos</span>
        </button>

        <div className="space-y-4">
          {results.map((test, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${test.status === 'success' ? 'bg-green-400/5 border-green-500/20' : 'bg-red-400/5 border-red-500/20'}`}>
              <div className="flex items-center gap-4 mb-2">
                {test.status === 'success' ? <CheckCircle className="text-green-400 w-5 h-5" /> : <XCircle className="text-red-400 w-5 h-5" />}
                <h3 className={`font-bold ${test.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{test.name}</h3>
              </div>
              <p className="text-slate-300 text-sm mb-2">{test.message}</p>
              {test.details && (
                <pre className="mt-4 p-4 bg-black/40 rounded-xl text-[10px] text-slate-500 overflow-x-auto">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/5">
             <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary italic">¿Qué hacer con este resultado?</h4>
             <p className="text-sm text-slate-400 leading-relaxed">
               Si ves <strong>"Database error querying schema"</strong> aquí arriba, significa que PostgREST no ha recargado el esquema. 
               Por favor, toma una captura de pantalla de este diagnóstico y mándamela.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
