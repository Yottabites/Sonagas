import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// import { prisma } from '../../lib/prisma'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']

const TRANSICOES_VALIDAS: Record<string, string[]> = {
  PLANEADA: ['EM_TRANSITO', 'CANCELADA'],
  EM_TRANSITO: ['ENTREGUE', 'CANCELADA'],
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

    const distribuicao = await prisma.distribuicao.findUnique({
      where: { id },
      include: {
        itens: { include: { produto: true } },
      },
    })

    if (!distribuicao) {
      return NextResponse.json(
        { message: 'Distribuição não encontrada.' },
        { status: 404 },
      )
    }

    const transicoesPermitidas = TRANSICOES_VALIDAS[distribuicao.status] ?? []

    if (!transicoesPermitidas.includes(novoStatus)) {
      return NextResponse.json(
        {
          message: `Não é possível mudar de "${distribuicao.status}" para "${novoStatus}".`,
        },
        { status: 400 },
      )
    }

    if (novoStatus === 'ENTREGUE') {
      // Ao marcar como entregue: dar baixa automática no estoque
      // para cada item da distribuição, a partir dos lotes disponíveis (FIFO).
      await prisma.$transaction(async (tx) => {
        for (const item of distribuicao.itens) {
          let quantidadeRestante = item.quantidade

          const lotes = await tx.loteEstoque.findMany({
            where: { produtoId: item.produtoId, quantidade: { gt: 0 } },
            orderBy: { dataEntrada: 'asc' }, // FIFO — lote mais antigo primeiro
          })

          for (const lote of lotes) {
            if (quantidadeRestante <= 0) break

            const baixa = Math.min(lote.quantidade, quantidadeRestante)
            quantidadeRestante -= baixa

            await tx.loteEstoque.update({
              where: { id: lote.id },
              data: { quantidade: { decrement: baixa } },
            })

            await tx.movimentoEstoque.create({
              data: {
                produtoId: item.produtoId,
                armazemId: lote.armazemId,
                loteId: lote.id,
                tipo: 'SAIDA',
                quantidade: baixa,
                referenciaDoc: `DIST-${id}`,
                distribuicaoId: id,
              },
            })
          }
        }

        await tx.distribuicao.update({
          where: { id },
          data: { status: 'ENTREGUE', dataEntrega: new Date() },
        })
      })
    } else {
      await prisma.distribuicao.update({
        where: { id },
        data: {
          status: novoStatus as any,
          ...(novoStatus === 'ENTREGUE' ? { dataEntrega: new Date() } : {}),
        },
      })
    }

    return NextResponse.json({
      message: 'Distribuição atualizada com sucesso.',
    })
  } catch (error) {
    console.error('Erro ao atualizar distribuição:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
