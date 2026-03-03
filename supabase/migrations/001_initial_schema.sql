-- PROYECTO FERIAS - SCHEMA INICIAL LIMPIO
-- Versión: 1.0.0 | Fecha: 2026-03-01

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tipo de Rol
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'expositor', 'visitante');

-- 3. Tabla Empresas (Multi-tenant)
CREATE TABLE public.empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    logo_url TEXT,
    plan TEXT DEFAULT 'basic',
    estado TEXT DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla Perfiles (extiende auth.users)
CREATE TABLE public.perfiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL DEFAULT 'Usuario',
    apellidos TEXT,
    rol user_role NOT NULL DEFAULT 'visitante',
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
CREATE POLICY "Users can view own profile" ON public.perfiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Superadmin can view all profiles" ON public.perfiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

CREATE POLICY "Users can update own profile" ON public.perfiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow trigger to insert profiles" ON public.perfiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view empresas" ON public.empresas
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Trigger automático al crear usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', SPLIT_PART(NEW.email, '@', 1)),
    'visitante'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Permisos
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

NOTIFY pgrst, 'reload schema';
