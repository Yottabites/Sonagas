import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '../../../core/lib/prisma'
import { verificarToken } from '@/lib/auth'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']
const STATUS_VALIDOS = ['PLANEADA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA']

async function obterPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get(NOME_COOKIE)?.value
  if (!token) return null
  const payload = verificarToken(token)
  if (!PERFIS_PERMITIDOS.includes(payload.perfil)) return null
  return payload
}

export async function GET(request: Request) {
  try {
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const cursor = searchParams.get('cursor')
    const limite = 10

    const where = {
      ...(status && STATUS_VALIDOS.includes(status)
        ? { status: status as any }
        : {}),
    }

    const distribuicoes = await prisma.distribuicao.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: limite + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        agente: { select: { id: true, nome: true, contacto: true } },
        pontoVenda: {
          select: {
            id: true,
            nome: true,
            codigo: true,
            revendedor: { select: { nome: true } },
          },
        },
        itens: { include: { produto: { select: { nome: true } } } },
      },
    })

    const temMais = distribuicoes.length > limite
    const pagina = temMais ? distribuicoes.slice(0, limite) : distribuicoes

    return NextResponse.json({
      distribuicoes: pagina.map((d) => ({
        id: d.id,
        status: d.status,
        dataPrevista: d.dataPrevista,
        dataEntrega: d.dataEntrega,
        observacoes: d.observacoes,
        agente: d.agente,
        pontoVenda: d.pontoVenda,
        itens: d.itens.map((item) => ({
          produto: item.produto.nome,
          quantidade: item.quantidade,
        })),
      })),
      proximoCursor: temMais ? pagina[pagina.length - 1].id : null,
    })
  } catch (error) {
    console.error('Erro ao listar distribuições:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { agenteId, pontoVendaId, dataPrevista, observacoes, itens } =
      await request.json()

    if (
      !agenteId ||
      !pontoVendaId ||
      !Array.isArray(itens) ||
      itens.length === 0
    ) {
      return NextResponse.json(
        { message: 'Agente, ponto de venda e itens são obrigatórios.' },
        { status: 400 },
      )
    }

    const distribuicao = await prisma.distribuicao.create({
      data: {
        agenteId,
        pontoVendaId,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
        observacoes,
        status: 'PLANEADA',
        itens: {
          create: itens.map(
            (item: { produtoId: string; quantidade: number }) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
            }),
          ),
        },
      },
      include: {
        agente: { select: { id: true, nome: true, contacto: true } },
        pontoVenda: {
          select: {
            id: true,
            nome: true,
            codigo: true,
            revendedor: { select: { nome: true } },
          },
        },
        itens: { include: { produto: { select: { nome: true } } } },
      },
    })

    return NextResponse.json({
      message: 'Distribuição criada com sucesso.',
      distribuicao,
    })
  } catch (error) {
    console.error('Erro ao criar distribuição:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
