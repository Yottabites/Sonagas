import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'FISCAL']

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
    const conformeParam = searchParams.get('conforme') // "true" | "false" | null
    const cursor = searchParams.get('cursor')
    const limite = 10

    const where = {
      ...(conformeParam === 'true' ? { conforme: true } : {}),
      ...(conformeParam === 'false' ? { conforme: false } : {}),
    }

    const fiscalizacoes = await prisma.fiscalizacao.findMany({
      where,
      orderBy: { dataFiscalizacao: 'desc' },
      take: limite + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        agente: { select: { nome: true, nif: true } },
        licenca: { select: { numero: true } },
        fiscal: { select: { nome: true } },
      },
    })

    const temMais = fiscalizacoes.length > limite
    const pagina = temMais ? fiscalizacoes.slice(0, limite) : fiscalizacoes

    return NextResponse.json({
      fiscalizacoes: pagina.map((f) => ({
        id: f.id,
        conforme: f.conforme,
        observacoes: f.observacoes,
        dataFiscalizacao: f.dataFiscalizacao,
        latitude: f.latitude,
        longitude: f.longitude,
        agente: f.agente,
        licenca: f.licenca,
        fiscal: f.fiscal,
      })),
      proximoCursor: temMais ? pagina[pagina.length - 1].id : null,
    })
  } catch (error) {
    console.error('Erro ao listar fiscalizações:', error)
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

    const { licencaId, conforme, observacoes, latitude, longitude } =
      await request.json()

    if (!licencaId || typeof conforme !== 'boolean') {
      return NextResponse.json(
        { message: 'Licença e conformidade são obrigatórios.' },
        { status: 400 },
      )
    }

    const licenca = await prisma.licenca.findUnique({
      where: { id: licencaId },
      select: { id: true, agenteId: true },
    })

    if (!licenca) {
      return NextResponse.json(
        { message: 'Licença não encontrada.' },
        { status: 404 },
      )
    }

    const fiscalizacao = await prisma.fiscalizacao.create({
      data: {
        licencaId: licenca.id,
        agenteId: licenca.agenteId,
        fiscalId: payload.sub,
        conforme,
        observacoes,
        latitude,
        longitude,
      },
      include: {
        agente: { select: { nome: true, nif: true } },
        licenca: { select: { numero: true } },
        fiscal: { select: { nome: true } },
      },
    })

    return NextResponse.json({
      message: 'Fiscalização registada com sucesso.',
      fiscalizacao,
    })
  } catch (error) {
    console.error('Erro ao registar fiscalização:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
