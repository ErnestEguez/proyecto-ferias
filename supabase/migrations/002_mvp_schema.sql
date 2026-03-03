-- ============================================================
-- PROYECTO FERIAS - MIGRACIÓN 002: SCHEMA COMPLETO MVP
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- Depende de: 001_initial_schema.sql (perfiles y empresas ya existen)
-- ============================================================

-- ==========================================
-- 1. AMPLIAR TABLA PERFILES (campos faltantes)
-- ==========================================
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS apellidos   TEXT,
  ADD COLUMN IF NOT EXISTS movil       TEXT,
  ADD COLUMN IF NOT EXISTS idioma      TEXT DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS avatar_url  TEXT,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- ==========================================
-- 2. AMPLIAR TABLA EMPRESAS
-- ==========================================
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS ruc         TEXT,
  ADD COLUMN IF NOT EXISTS email       TEXT,
  ADD COLUMN IF NOT EXISTS telefono    TEXT,
  ADD COLUMN IF NOT EXISTS logo_url    TEXT,
  ADD COLUMN IF NOT EXISTS plan        TEXT DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS estado      TEXT DEFAULT 'activo';

-- ==========================================
-- 3. TABLA FERIAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ferias (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id              UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    codigo                  TEXT UNIQUE,
    nombre                  TEXT NOT NULL,
    descripcion             TEXT,
    fecha_inicio_registro   DATE,
    fecha_inicio            DATE,
    fecha_fin               DATE,
    ubicacion               TEXT,
    plano_url               TEXT,
    logo_url                TEXT,
    estado                  TEXT DEFAULT 'borrador'
                              CHECK (estado IN ('borrador','activo','finalizado')),
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. TABLA EXPOSITORES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.expositores (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id        UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    feria_id          UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    perfil_id         UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    nombre_comercial  TEXT NOT NULL,
    ruc               TEXT,
    responsable       TEXT,
    movil             TEXT,
    email             TEXT,
    direccion         TEXT,
    ciudad            TEXT,
    pais              TEXT DEFAULT 'Ecuador',
    descripcion       TEXT,
    logo_url          TEXT,
    rubro             TEXT,
    observaciones     TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. TABLA STANDS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.stands (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id        UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    feria_id          UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    expositor_id      UUID REFERENCES public.expositores(id) ON DELETE SET NULL,
    numero            TEXT NOT NULL,
    tipo              TEXT DEFAULT 'stand'
                        CHECK (tipo IN ('stand','oficina','baño','area_social','alimentos','otro')),
    posicion_x        FLOAT DEFAULT 0,
    posicion_y        FLOAT DEFAULT 0,
    carpeta_imagenes  TEXT,
    estado            TEXT DEFAULT 'disponible'
                        CHECK (estado IN ('disponible','ocupado','reservado')),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feria_id, numero)
);

-- ==========================================
-- 6. TABLA VISITANTES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.visitantes (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feria_id              UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    perfil_id             UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    qr_token              TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
    consentimiento_datos  BOOLEAN DEFAULT false,
    consentimiento_leads  BOOLEAN DEFAULT false,
    calificacion          TEXT,
    comentarios           TEXT,
    fecha_ingreso         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feria_id, perfil_id)
);

-- ==========================================
-- 7. TABLA LEADS (MVP Mínimo)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leads (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feria_id      UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    expositor_id  UUID REFERENCES public.expositores(id) ON DELETE CASCADE NOT NULL,
    visitante_id  UUID REFERENCES public.visitantes(id) ON DELETE CASCADE NOT NULL,
    calificacion  TEXT DEFAULT 'frio'
                    CHECK (calificacion IN ('frio','tibio','caliente')),
    notas         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(expositor_id, visitante_id)
);

-- ==========================================
-- 8. TABLA EVENTOS (MVP Mínimo)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.eventos (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feria_id     UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    nombre       TEXT NOT NULL,
    descripcion  TEXT,
    tipo         TEXT DEFAULT 'charla'
                   CHECK (tipo IN ('charla','curso','taller','congreso','otro')),
    horario      TIMESTAMPTZ,
    precio       DECIMAL(10,2) DEFAULT 0.00,
    capacidad    INT,
    estado       TEXT DEFAULT 'activo'
                   CHECK (estado IN ('activo','cancelado','finalizado')),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. TABLA INSCRIPCIONES A EVENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.inscripciones_eventos (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id     UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
    visitante_id  UUID REFERENCES public.visitantes(id) ON DELETE CASCADE NOT NULL,
    estado_pago   TEXT DEFAULT 'pendiente'
                    CHECK (estado_pago IN ('pendiente','pagado')),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(evento_id, visitante_id)
);

-- ==========================================
-- 10. TABLA MENSAJES (Chat básico)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.mensajes (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feria_id        UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    remitente_id    UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    destinatario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    contenido       TEXT NOT NULL,
    leido           BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 11. TABLA NOTIFICACIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feria_id     UUID REFERENCES public.ferias(id) ON DELETE CASCADE NOT NULL,
    creado_por   UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    titulo       TEXT NOT NULL,
    mensaje      TEXT NOT NULL,
    enviada_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 12. TABLA FAVORITOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.favoritos (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitante_id  UUID REFERENCES public.visitantes(id) ON DELETE CASCADE NOT NULL,
    expositor_id  UUID REFERENCES public.expositores(id) ON DELETE CASCADE NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(visitante_id, expositor_id)
);

-- ==========================================
-- 13. HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================
ALTER TABLE public.ferias                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expositores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitantes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos             ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 14. FUNCIÓN AUXILIAR: obtener rol del usuario actual
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT rol::TEXT FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==========================================
-- 15. POLÍTICAS RLS POR ROL
-- ==========================================

-- FERIAS
CREATE POLICY "ferias_superadmin_all"   ON public.ferias FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "ferias_admin_empresa"    ON public.ferias FOR ALL USING (
    public.get_my_role() = 'admin' AND
    empresa_id IN (SELECT empresa_id FROM public.perfiles WHERE id = auth.uid())
);
CREATE POLICY "ferias_read_activas"     ON public.ferias FOR SELECT USING (estado = 'activo');

-- EXPOSITORES
CREATE POLICY "expositores_superadmin"  ON public.expositores FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "expositores_admin"       ON public.expositores FOR ALL USING (
    public.get_my_role() = 'admin' AND
    empresa_id IN (SELECT empresa_id FROM public.perfiles WHERE id = auth.uid())
);
CREATE POLICY "expositores_read"        ON public.expositores FOR SELECT USING (auth.role() = 'authenticated');

-- STANDS
CREATE POLICY "stands_superadmin"       ON public.stands FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "stands_admin"            ON public.stands FOR ALL USING (
    public.get_my_role() = 'admin' AND
    empresa_id IN (SELECT empresa_id FROM public.perfiles WHERE id = auth.uid())
);
CREATE POLICY "stands_read"             ON public.stands FOR SELECT USING (auth.role() = 'authenticated');

-- VISITANTES
CREATE POLICY "visitantes_superadmin"   ON public.visitantes FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "visitantes_admin"        ON public.visitantes FOR SELECT USING (public.get_my_role() = 'admin');
CREATE POLICY "visitantes_own"          ON public.visitantes FOR ALL USING (perfil_id = auth.uid());
CREATE POLICY "visitantes_insert"       ON public.visitantes FOR INSERT WITH CHECK (perfil_id = auth.uid());

-- LEADS
CREATE POLICY "leads_superadmin"        ON public.leads FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "leads_admin"             ON public.leads FOR SELECT USING (public.get_my_role() = 'admin');
CREATE POLICY "leads_expositor"         ON public.leads FOR ALL USING (
    expositor_id IN (SELECT id FROM public.expositores WHERE perfil_id = auth.uid())
);

-- EVENTOS
CREATE POLICY "eventos_superadmin"      ON public.eventos FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "eventos_admin"           ON public.eventos FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "eventos_read"            ON public.eventos FOR SELECT USING (auth.role() = 'authenticated');

-- INSCRIPCIONES
CREATE POLICY "inscripciones_superadmin" ON public.inscripciones_eventos FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "inscripciones_admin"      ON public.inscripciones_eventos FOR SELECT USING (public.get_my_role() = 'admin');
CREATE POLICY "inscripciones_own"        ON public.inscripciones_eventos FOR ALL USING (
    visitante_id IN (SELECT id FROM public.visitantes WHERE perfil_id = auth.uid())
);

-- MENSAJES
CREATE POLICY "mensajes_superadmin"     ON public.mensajes FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "mensajes_participants"   ON public.mensajes FOR ALL USING (
    remitente_id = auth.uid() OR destinatario_id = auth.uid()
);

-- NOTIFICACIONES
CREATE POLICY "notif_superadmin"        ON public.notificaciones FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "notif_admin_create"      ON public.notificaciones FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "notif_read"             ON public.notificaciones FOR SELECT USING (auth.role() = 'authenticated');

-- FAVORITOS
CREATE POLICY "favoritos_own"           ON public.favoritos FOR ALL USING (
    visitante_id IN (SELECT id FROM public.visitantes WHERE perfil_id = auth.uid())
);

-- ==========================================
-- 16. EMPRESAS - Políticas adicionales
-- ==========================================
CREATE POLICY "empresas_superadmin"     ON public.empresas FOR ALL USING (public.get_my_role() = 'superadmin');
CREATE POLICY "empresas_admin_own"      ON public.empresas FOR SELECT USING (
    id IN (SELECT empresa_id FROM public.perfiles WHERE id = auth.uid())
);

-- ==========================================
-- 17. PERMISOS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;

-- 18. Recargar PostgREST
NOTIFY pgrst, 'reload schema';

-- 19. Verificación
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
