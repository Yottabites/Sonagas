import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_INTERNOS = [
  'ADMIN',
  'GESTOR_LICENCAS',
  'GESTOR_ESTOQUE',
  'FISCAL',
  'ANALISTA',
]

async function obterPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get(NOME_COOKIE)?.value
  if (!token) return null
  const payload = verificarToken(token)
  if (!PERFIS_INTERNOS.includes(payload.perfil)) return null
  return payload
}

export async function GET() {
  try {
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        criadoEm: true,
      },
    })

    if (!utilizador) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    return NextResponse.json({ utilizador })
  } catch (error) {
    console.error('Erro ao obter perfil:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const { nome, email } = await request.json()

    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
      return NextResponse.json(
        { message: 'O nome precisa ter pelo menos 3 caracteres.' },
        { status: 400 },
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email é obrigatório.' },
        { status: 400 },
      )
    }

    const emailEmUso = await prisma.utilizador.findFirst({
      where: { email, NOT: { id: payload.sub } },
    })

    if (emailEmUso) {
      return NextResponse.json(
        { message: 'Este email já está a ser utilizado por outra conta.' },
        { status: 409 },
      )
    }

    const utilizador = await prisma.utilizador.update({
      where: { id: payload.sub },
      data: { nome: nome.trim(), email },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        criadoEm: true,
      },
    })

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso.',
      utilizador,
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
