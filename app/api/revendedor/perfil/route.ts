import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'

async function obterUtilizadorAutenticado() {
  const cookieStore = await cookies()
  const token = cookieStore.get(NOME_COOKIE)?.value
  if (!token) return null
  return verificarToken(token)
}

export async function GET() {
  try {
    const payload = await obterUtilizadorAutenticado()

    if (!payload || !payload.revendedorId) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const [utilizador, revendedor] = await Promise.all([
      prisma.utilizador.findUnique({
        where: { id: payload.sub },
        select: { id: true, nome: true, email: true, perfil: true },
      }),
      prisma.revendedor.findUnique({
        where: { id: payload.revendedorId },
        select: {
          id: true,
          nome: true,
          nif: true,
          tipo: true,
          contacto: true,
          email: true,
        },
      }),
    ])

    if (!utilizador || !revendedor) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    return NextResponse.json({ utilizador, revendedor })
  } catch (error) {
    console.error('Erro ao obter perfil:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await obterUtilizadorAutenticado()

    if (!payload || !payload.revendedorId) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const { nome, contacto, email } = await request.json()

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

    // Confirma que o novo email não está a ser usado por outro utilizador
    const emailEmUso = await prisma.utilizador.findFirst({
      where: { email, NOT: { id: payload.sub } },
    })

    if (emailEmUso) {
      return NextResponse.json(
        { message: 'Este email já está a ser utilizado por outra conta.' },
        { status: 409 },
      )
    }

    // Mantém Utilizador.nome e Revendedor.nome sincronizados,
    // já que representam a mesma entidade do ponto de vista do negócio.
    const [utilizador, revendedor] = await prisma.$transaction([
      prisma.utilizador.update({
        where: { id: payload.sub },
        data: { nome: nome.trim(), email },
        select: { id: true, nome: true, email: true, perfil: true },
      }),
      prisma.revendedor.update({
        where: { id: payload.revendedorId },
        data: { nome: nome.trim(), contacto, email },
        select: {
          id: true,
          nome: true,
          nif: true,
          tipo: true,
          contacto: true,
          email: true,
        },
      }),
    ])

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso.',
      utilizador,
      revendedor,
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
