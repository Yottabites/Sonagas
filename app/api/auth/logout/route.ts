import { NextResponse } from 'next/server'

const NOME_COOKIE = 'sonagas_token'

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão terminada.' })
  response.cookies.delete(NOME_COOKIE)
  return response
}
