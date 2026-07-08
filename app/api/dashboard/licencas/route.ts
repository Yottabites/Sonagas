import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_LICENCAS']

const STATUS_VALIDOS = [
  'ATIVA',
  'PENDENTE_RENOVACAO',
  'EXPIRADA',
  'SUSPENSA',
  'CANCELADA',
]

async function obterPayloadAutorizado() {
  const cookieStore = await cookies()
  const token = cookieStore.get(NOME_COOKIE)?.value
  if (!token) return null
  const payload = verificarToken(token)
  if (!PERFIS_PERMITIDOS.includes(payload.perfil)) return null
  return payload
}

export async function GET(request: Request) {
  try {
    const payload = await obterPayloadAutorizado()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const busca = searchParams.get('busca') // numero da licença ou nome do agente
    const cursor = searchParams.get('cursor')
    const limite = 10

    const where = {
      ...(status && STATUS_VALIDOS.includes(status)
        ? { status: status as any }
        : {}),
      ...(busca
        ? {
            OR: [
              { numero: { contains: busca } },
              { agente: { nome: { contains: busca } } },
            ],
          }
        : {}),
    }

    const licencas = await prisma.licenca.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: limite + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        agente: { select: { id: true, nome: true, nif: true } },
      },
    })

    const temMais = licencas.length > limite
    const pagina = temMais ? licencas.slice(0, limite) : licencas

    return NextResponse.json({
      licencas: pagina.map((l) => ({
        id: l.id,
        numero: l.numero,
        status: l.status,
        dataEmissao: l.dataEmissao,
        dataValidade: l.dataValidade,
        sapReferencia: l.sapReferencia,
        agente: l.agente,
      })),
      proximoCursor: temMais ? pagina[pagina.length - 1].id : null,
    })
  } catch (error) {
    console.error('Erro ao listar licenças:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const payload = await obterPayloadAutorizado()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { agenteId, numero, dataEmissao, dataValidade, sapReferencia } =
      await request.json()

    if (!agenteId || !numero || !dataEmissao || !dataValidade) {
      return NextResponse.json(
        {
          message:
            'Agente, número, data de emissão e validade são obrigatórios.',
        },
        { status: 400 },
      )
    }

    const numeroEmUso = await prisma.licenca.findUnique({ where: { numero } })
    if (numeroEmUso) {
      return NextResponse.json(
        { message: 'Já existe uma licença com este número.' },
        { status: 409 },
      )
    }

    const licenca = await prisma.licenca.create({
      data: {
        agenteId,
        numero,
        dataEmissao: new Date(dataEmissao),
        dataValidade: new Date(dataValidade),
        sapReferencia,
        status: 'ATIVA',
      },
      include: { agente: { select: { nome: true, nif: true } } },
    })

    return NextResponse.json({
      message: 'Licença criada com sucesso.',
      licenca,
    })
  } catch (error) {
    console.error('Erro ao criar licença:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
