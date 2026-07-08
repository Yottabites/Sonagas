import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '../../../core/lib/prisma'
import { verificarToken } from '@/lib/auth'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!PERFIS_PERMITIDOS.includes(payload.perfil)) {
      return NextResponse.json(
        { message: 'Sem permissão para este recurso.' },
        { status: 403 },
      )
    }

    const pontosVenda = await prisma.pontoVenda.findMany({
      where: { status: 'ATIVO' },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        codigo: true,
        revendedor: { select: { nome: true } },
      },
    })

    return NextResponse.json({ pontosVenda })
  } catch (error) {
    console.error('Erro ao listar pontos de venda:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}
