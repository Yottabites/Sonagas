import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_LICENCAS']

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

    const { novaValidade } = await request.json()

    if (!novaValidade) {
      return NextResponse.json(
        { message: 'A nova data de validade é obrigatória.' },
        { status: 400 },
      )
    }

    const licenca = await prisma.licenca.findUnique({ where: { id } })

    if (!licenca) {
      return NextResponse.json(
        { message: 'Licença não encontrada.' },
        { status: 404 },
      )
    }

    if (licenca.status !== 'PENDENTE_RENOVACAO') {
      return NextResponse.json(
        { message: 'Esta licença não está pendente de renovação.' },
        { status: 400 },
      )
    }

    const renovacaoPendente = await prisma.renovacaoLicenca.findFirst({
      where: { licencaId: id, aprovado: null },
      orderBy: { dataSolicitacao: 'desc' },
    })

    const [licencaAtualizada] = await prisma.$transaction([
      prisma.licenca.update({
        where: { id },
        data: {
          status: 'ATIVA',
          dataValidade: new Date(novaValidade),
        },
        include: { agente: { select: { nome: true, nif: true } } },
      }),
      ...(renovacaoPendente
        ? [
            prisma.renovacaoLicenca.update({
              where: { id: renovacaoPendente.id },
              data: {
                aprovado: true,
                dataAprovacao: new Date(),
                novaValidade: new Date(novaValidade),
              },
            }),
          ]
        : []),
    ])

    return NextResponse.json({
      message: 'Renovação aprovada com sucesso.',
      licenca: licencaAtualizada,
    })
  } catch (error) {
    console.error('Erro ao aprovar renovação:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
