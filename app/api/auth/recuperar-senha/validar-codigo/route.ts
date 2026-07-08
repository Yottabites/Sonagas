import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../core/lib/prisma'

const MAX_TENTATIVAS = 3

export async function POST(request: Request) {
  try {
    const { email, codigo } = await request.json()

    if (!email || !codigo) {
      return NextResponse.json(
        { message: 'Email e código são obrigatórios.' },
        { status: 400 },
      )
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { email },
    })

    if (!utilizador) {
      return NextResponse.json(
        { message: 'Código inválido ou expirado.' },
        { status: 400 },
      )
    }

    const registoCodigo = await prisma.codigoRecuperacaoSenha.findFirst({
      where: {
        utilizadorId: utilizador.id,
        usado: false,
      },
      orderBy: { criadoEm: 'desc' },
    })

    if (!registoCodigo) {
      return NextResponse.json(
        { message: 'Código inválido ou expirado.' },
        { status: 400 },
      )
    }

    if (registoCodigo.expiraEm < new Date()) {
      return NextResponse.json(
        { message: 'O código expirou. Solicite um novo.' },
        { status: 400 },
      )
    }

    if (registoCodigo.tentativas >= MAX_TENTATIVAS) {
      return NextResponse.json(
        {
          message:
            'Número máximo de tentativas excedido. Solicite um novo código.',
        },
        { status: 429 },
      )
    }

    const codigoValido = await bcrypt.compare(codigo, registoCodigo.codigoHash)

    if (!codigoValido) {
      await prisma.codigoRecuperacaoSenha.update({
        where: { id: registoCodigo.id },
        data: { tentativas: { increment: 1 } },
      })

      return NextResponse.json(
        { message: 'Código inválido ou expirado.' },
        { status: 400 },
      )
    }

    // Código válido — não marcamos como "usado" ainda,
    // só será consumido definitivamente na etapa de atualizar a senha.
    return NextResponse.json({ message: 'Código validado com sucesso.' })
  } catch (error) {
    console.error('Erro ao validar código de recuperação:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
