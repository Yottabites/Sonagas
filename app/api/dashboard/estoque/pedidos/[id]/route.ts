import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']
const TRANSICOES_VALIDAS: Record<string, string[]> = {
  PENDENTE: ['APROVADO', 'REJEITADO'],
  APROVADO: ['EM_PROCESSAMENTO'],
  EM_PROCESSAMENTO: ['CONCLUIDO'],
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!PERFIS_PERMITIDOS.includes(payload.perfil)) {
      return NextResponse.json(
        { message: 'Sem permissão para esta ação.' },
        { status: 403 },
      )
    }

    const { status: novoStatus } = await request.json()

    const pedido = await prisma.pedido.findUnique({ where: { id } })

    if (!pedido) {
      return NextResponse.json(
        { message: 'Pedido não encontrado.' },
        { status: 404 },
      )
    }

    const transicoesPermitidas = TRANSICOES_VALIDAS[pedido.status] ?? []

    if (!transicoesPermitidas.includes(novoStatus)) {
      return NextResponse.json(
        {
          message: `Não é possível mudar de "${pedido.status}" para "${novoStatus}".`,
        },
        { status: 400 },
      )
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: { status: novoStatus },
      include: {
        revendedor: { select: { nome: true, tipo: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
    })

    return NextResponse.json({
      message: 'Estado do pedido atualizado com sucesso.',
      pedido: pedidoAtualizado,
    })
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
