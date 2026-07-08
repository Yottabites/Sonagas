import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        revendedorId: true,
      },
    })

    if (!utilizador) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    return NextResponse.json({ utilizador })
  } catch (error) {
    return NextResponse.json(
      { message: 'Sessão inválida ou expirada.' },
      { status: 401 },
    )
  }
}
