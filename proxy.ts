import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'

const NOME_COOKIE = 'sonagas_token'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(NOME_COOKIE)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const payload = verificarToken(token)
    const ehVendedor =
      payload.perfil === 'REVENDEDOR' || payload.perfil === 'GROSSISTA'

    // Vendedores só podem estar em /revendedor
    if (pathname.startsWith('/revendedor') && !ehVendedor) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Utilizadores internos não entram em /revendedor
    if (pathname.startsWith('/dashboard') && ehVendedor) {
      return NextResponse.redirect(new URL('/revendedor', request.url))
    }

    return NextResponse.next()
  } catch {
    // Token inválido ou expirado
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete(NOME_COOKIE)
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/revendedor/:path*'],
}
