import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// RUTAS Y PERMISOS POR ROL
// ============================================================
const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/superadmin': ['superadmin'],
  '/admin': ['superadmin', 'admin'],
  '/dashboard': ['superadmin', 'admin', 'expositor', 'visitante'],
}

const ROLE_HOME: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/admin',
  expositor: '/dashboard',
  visitante: '/dashboard',
}

// ============================================================
// PROXY PRINCIPAL (equivalente al middleware en Next.js 16)
// ============================================================
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refrescar sesión (obligatorio en proxy de Supabase)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. Rutas públicas
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  if (isPublicRoute) {
    // Si ya tiene sesión, redirigir al home de su rol
    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles').select('rol').eq('id', user.id).single()
      const home = ROLE_HOME[perfil?.rol ?? 'visitante'] ?? '/dashboard'
      return NextResponse.redirect(new URL(home, request.url))
    }
    return response
  }

  // 2. Sin sesión → login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Verificar rol para la ruta
  const matchedRoute = Object.keys(PROTECTED_ROUTES).find(r => pathname.startsWith(r))
  if (matchedRoute) {
    const allowed = PROTECTED_ROUTES[matchedRoute]
    if (allowed.length > 0) {
      const { data: perfil } = await supabase
        .from('perfiles').select('rol').eq('id', user.id).single()
      const rol = perfil?.rol ?? 'visitante'
      if (!allowed.includes(rol)) {
        const home = ROLE_HOME[rol] ?? '/dashboard'
        return NextResponse.redirect(new URL(home, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
