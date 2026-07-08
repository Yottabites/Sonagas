import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// import { prisma } from '@/lib/prisma'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'

// Quantidade mínima por item, diferente conforme o perfil do vendedor.
// Grossista compra em maior volume, por isso o mínimo é mais alto.
const QUANTIDADE_MINIMA_POR_PERFIL: Record<string, number> = {
  GROSSISTA: 50,
  REVENDEDOR: 1,
}

const STATUS_VALIDOS = [
  'PENDENTE',
  'APROVADO',
  'EM_PROCESSAMENTO',
  'CONCLUIDO',
  'REJEITADO',
]

interface ItemPedidoInput {
  produtoId: string
  quantidade: number
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const cursor = searchParams.get('cursor') // id do último pedido carregado
    const limite = 10

    const where = {
      revendedorId: payload.revendedorId,
      ...(status && STATUS_VALIDOS.includes(status)
        ? { status: status as any }
        : {}),
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: limite + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        itens: { include: { produto: { select: { nome: true } } } },
      },
    })

    const temMais = pedidos.length > limite
    const pedidosPagina = temMais ? pedidos.slice(0, limite) : pedidos

    return NextResponse.json({
      pedidos: pedidosPagina.map((p) => ({
        id: p.id,
        status: p.status,
        observacoes: p.observacoes,
        criadoEm: p.criadoEm,
        itens: p.itens.map((item) => ({
          produto: item.produto.nome,
          quantidade: item.quantidade,
        })),
      })),
      proximoCursor: temMais
        ? pedidosPagina[pedidosPagina.length - 1].id
        : null,
    })
  } catch (error) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)

    if (
      !payload.revendedorId ||
      (payload.perfil !== 'REVENDEDOR' && payload.perfil !== 'GROSSISTA')
    ) {
      return NextResponse.json(
        { message: 'Apenas revendedores/grossistas podem fazer pedidos.' },
        { status: 403 },
      )
    }

    const { itens, observacoes } = (await request.json()) as {
      itens: ItemPedidoInput[]
      observacoes?: string
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { message: 'O pedido precisa ter pelo menos um item.' },
        { status: 400 },
      )
    }

    const quantidadeMinima = QUANTIDADE_MINIMA_POR_PERFIL[payload.perfil] ?? 1

    for (const item of itens) {
      if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
        return NextResponse.json(
          { message: 'Cada item precisa de produto e quantidade válidos.' },
          { status: 400 },
        )
      }
      if (item.quantidade < quantidadeMinima) {
        return NextResponse.json(
          {
            message:
              payload.perfil === 'GROSSISTA'
                ? `Como grossista, a quantidade mínima por produto é ${quantidadeMinima} unidades.`
                : `A quantidade mínima por produto é ${quantidadeMinima} unidade.`,
          },
          { status: 400 },
        )
      }
    }

    const pedido = await prisma.pedido.create({
      data: {
        revendedorId: payload.revendedorId,
        observacoes,
        itens: {
          create: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
        },
      },
      include: {
        itens: { include: { produto: true } },
      },
    })

    return NextResponse.json({
      message: 'Pedido criado com sucesso.',
      pedido,
    })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
