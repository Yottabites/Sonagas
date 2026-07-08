import { NextResponse } from 'next/server'
import { prisma } from '../../core/lib/prisma'

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        codigo: true,
        pesoKg: true,
      },
    })

    return NextResponse.json({ produtos })
  } catch (error) {
    console.error('Erro ao listar produtos:', error)
    return NextResponse.json(
      { message: 'Erro ao obter produtos.' },
      { status: 500 },
    )
  }
}
