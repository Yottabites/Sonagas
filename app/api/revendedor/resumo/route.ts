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

    if (!payload.revendedorId) {
      return NextResponse.json(
        {
          message: 'Apenas revendedores/grossistas têm acesso a este recurso.',
        },
        { status: 403 },
      )
    }

    const revendedorId = payload.revendedorId

    const [
      revendedor,
      pedidosPendentes,
      pedidosEmProcessamento,
      distribuicoesEmTransito,
      ultimosPedidos,
      pontosVenda,
    ] = await Promise.all([
      prisma.revendedor.findUnique({ where: { id: revendedorId } }),
      prisma.pedido.count({
        where: { revendedorId, status: 'PENDENTE' },
      }),
      prisma.pedido.count({
        where: { revendedorId, status: 'EM_PROCESSAMENTO' },
      }),
      prisma.distribuicao.count({
        where: {
          status: 'EM_TRANSITO',
          pontoVenda: { revendedorId },
        },
      }),
      prisma.pedido.findMany({
        where: { revendedorId },
        orderBy: { criadoEm: 'desc' },
        take: 5,
        include: {
          itens: { include: { produto: true } },
        },
      }),
      prisma.pontoVenda.findMany({
        where: { revendedorId },
      }),
    ])

    return NextResponse.json({
      revendedor: revendedor
        ? { nome: revendedor.nome, tipo: revendedor.tipo }
        : null,
      resumo: {
        pedidosPendentes,
        pedidosEmProcessamento,
        distribuicoesEmTransito,
        totalPontosVenda: pontosVenda.length,
      },
      ultimosPedidos: ultimosPedidos.map((pedido) => ({
        id: pedido.id,
        status: pedido.status,
        criadoEm: pedido.criadoEm,
        itens: pedido.itens.map((item) => ({
          produto: item.produto.nome,
          quantidade: item.quantidade,
        })),
      })),
    })
  } catch (error) {
    console.error('Erro ao obter resumo do revendedor:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}
