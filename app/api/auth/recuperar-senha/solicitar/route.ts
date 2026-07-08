import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import {
  enviarEmail,
  templateCodigoRecuperacao,
} from '../../../../core/lib/email'
import { prisma } from '../../../../core/lib/prisma'

const SALT_ROUNDS = 10
const CODIGO_EXPIRACAO_MINUTOS = 10

function gerarCodigoNumerico(): string {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6 dígitos
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email é obrigatório.' },
        { status: 400 },
      )
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { email },
    })

    // Resposta genérica mesmo se o utilizador não existir,
    // para não revelar quais emails estão cadastrados.
    if (!utilizador) {
      return NextResponse.json({
        message: 'Se o email existir, um código foi enviado.',
      })
    }

    const codigo = gerarCodigoNumerico()
    const codigoHash = await bcrypt.hash(codigo, SALT_ROUNDS)
    const expiraEm = new Date(Date.now() + CODIGO_EXPIRACAO_MINUTOS * 60 * 1000)

    // Invalida códigos anteriores ainda não usados
    await prisma.codigoRecuperacaoSenha.updateMany({
      where: { utilizadorId: utilizador.id, usado: false },
      data: { usado: true },
    })

    await prisma.codigoRecuperacaoSenha.create({
      data: {
        utilizadorId: utilizador.id,
        codigoHash,
        expiraEm,
      },
    })

    await enviarEmail({
      para: utilizador.email,
      assunto: 'Código de recuperação de senha — Sonagás',
      html: templateCodigoRecuperacao(codigo, utilizador.nome),
    })

    return NextResponse.json({
      message: 'Se o email existir, um código foi enviado.',
    })
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}
