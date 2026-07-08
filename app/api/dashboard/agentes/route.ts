import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_LICENCAS', 'FISCAL']

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

    const agentes = await prisma.agente.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, nif: true },
    })

    return NextResponse.json({ agentes })
  } catch (error) {
    console.error('Erro ao listar agentes:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}
