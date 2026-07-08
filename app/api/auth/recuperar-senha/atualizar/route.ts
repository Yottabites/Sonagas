import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../core/lib/prisma'

const SALT_ROUNDS = 10
const MAX_TENTATIVAS = 3

export async function POST(request: Request) {
  try {
    const { email, codigo, novaSenha } = await request.json()

    if (!email || !codigo || !novaSenha) {
      return NextResponse.json(
        { message: 'Email, código e nova senha são obrigatórios.' },
        { status: 400 },
      )
    }

    if (typeof novaSenha !== 'string' || novaSenha.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 8 caracteres.' },
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

    const novaSenhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS)

    // Atualiza a senha e consome o código numa única transação
    await prisma.$transaction([
      prisma.utilizador.update({
        where: { id: utilizador.id },
        data: { senha: novaSenhaHash },
      }),
      prisma.codigoRecuperacaoSenha.update({
        where: { id: registoCodigo.id },
        data: { usado: true },
      }),
    ])

    return NextResponse.json({ message: 'Senha atualizada com sucesso.' })
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
