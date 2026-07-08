'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type Etapa = 'EMAIL' | 'CODIGO' | 'NOVA_SENHA' | 'CONCLUIDO'

export default function RecuperarSenhaSonagas() {
  const router = useRouter()

  const [etapa, setEtapa] = useState<Etapa>('EMAIL')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // dados que percorrem as etapas
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  const codigoInputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [digitos, setDigitos] = useState<string[]>(['', '', '', '', '', ''])

  // --------------------------------------------------------
  // ETAPA 1 — Solicitar envio do código por email
  // --------------------------------------------------------
  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/recuperar-senha/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message ?? 'Não foi possível enviar o código.')
      }

      setEtapa('CODIGO')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------------
  // ETAPA 2 — Validar código recebido por email
  // --------------------------------------------------------
  function handleChangeDigito(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const novosDigitos = [...digitos]
    novosDigitos[index] = value.slice(-1)
    setDigitos(novosDigitos)
    setCodigo(novosDigitos.join(''))

    if (value && index < 5) {
      codigoInputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDownDigito(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      codigoInputsRef.current[index - 1]?.focus()
    }
  }

  function handlePasteDigitos(e: React.ClipboardEvent<HTMLInputElement>) {
    const texto = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(texto)) return
    e.preventDefault()
    const novosDigitos = texto.split('')
    setDigitos(novosDigitos)
    setCodigo(texto)
    codigoInputsRef.current[5]?.focus()
  }

  async function handleValidarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (codigo.length !== 6) {
      setErro('Introduza o código de 6 dígitos.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/recuperar-senha/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message ?? 'Código inválido ou expirado.')
      }

      setEtapa('NOVA_SENHA')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviarCodigo() {
    setErro(null)
    setLoading(true)
    try {
      await fetch('/api/auth/recuperar-senha/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------------
  // ETAPA 3 — Definir nova senha
  // --------------------------------------------------------
  async function handleAtualizarSenha(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (novaSenha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/recuperar-senha/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, novaSenha }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message ?? 'Não foi possível atualizar a senha.')
      }

      setEtapa('CONCLUIDO')

      // pequena pausa para o utilizador ver a confirmação, depois volta ao login
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAF8] px-6 py-12 font-[Inter]">
      <div className="w-full max-w-sm">
        {/* logo */}
        <div className="mb-10 flex justify-center">
          <Image
            src="/sonagas.png"
            alt="Sonagás Energias Renováveis"
            width={160}
            height={54}
            className="h-11 w-auto object-contain"
            priority
          />
        </div>

        {/* indicador de progresso */}
        {etapa !== 'CONCLUIDO' && (
          <div className="mb-8 flex items-center justify-center gap-2">
            {(['EMAIL', 'CODIGO', 'NOVA_SENHA'] as Etapa[]).map((e, i) => {
              const ativo =
                e === etapa ||
                (['CODIGO', 'NOVA_SENHA'].indexOf(etapa) >
                  ['CODIGO', 'NOVA_SENHA'].indexOf(e) &&
                  i < ['EMAIL', 'CODIGO', 'NOVA_SENHA'].indexOf(etapa) + 1)
              const completo =
                ['EMAIL', 'CODIGO', 'NOVA_SENHA'].indexOf(etapa) > i
              return (
                <span
                  key={e}
                  className={`h-1.5 w-10 rounded-full transition-colors ${
                    completo || e === etapa ? 'bg-[#E2231A]' : 'bg-[#1A1A1A]/10'
                  }`}
                />
              )
            })}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ETAPA 1 — EMAIL */}
        {/* ---------------------------------------------------- */}
        {etapa === 'EMAIL' && (
          <>
            <div className="mb-8 space-y-1.5 text-center">
              <h1 className="font-[Roboto] text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Recuperar senha
              </h1>
              <p className="text-sm text-[#1A1A1A]/60">
                Introduza o seu email institucional. Vamos enviar-lhe um código
                de verificação.
              </p>
            </div>

            <form onSubmit={handleEnviarCodigo} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1A1A1A]">
                  Email institucional
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@sonagas.co.ao"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-[#1A1A1A]/15 pl-10 focus-visible:ring-[#E2231A]"
                  />
                </div>
              </div>

              {erro && (
                <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
                  {erro}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Enviar código
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <Link
              href="/"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao login
            </Link>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* ETAPA 2 — CÓDIGO */}
        {/* ---------------------------------------------------- */}
        {etapa === 'CODIGO' && (
          <>
            <div className="mb-8 space-y-1.5 text-center">
              <h1 className="font-[Roboto] text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Verifique o seu email
              </h1>
              <p className="text-sm text-[#1A1A1A]/60">
                Enviámos um código de 6 dígitos para{' '}
                <span className="font-medium text-[#1A1A1A]">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleValidarCodigo} className="space-y-5">
              <div className="flex justify-between gap-2">
                {digitos.map((digito, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      codigoInputsRef.current[index] = el
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    value={digito}
                    onChange={(e) => handleChangeDigito(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDownDigito(index, e)}
                    onPaste={index === 0 ? handlePasteDigitos : undefined}
                    className="h-12 w-12 text-center text-lg font-semibold text-[#1A1A1A] border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
                  />
                ))}
              </div>

              {erro && (
                <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
                  {erro}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Validar código
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setEtapa('EMAIL')}
                className="flex items-center gap-1.5 font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Trocar email
              </button>
              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={loading}
                className="font-medium text-[#E2231A] hover:underline disabled:opacity-50"
              >
                Reenviar código
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* ETAPA 3 — NOVA SENHA */}
        {/* ---------------------------------------------------- */}
        {etapa === 'NOVA_SENHA' && (
          <>
            <div className="mb-8 space-y-1.5 text-center">
              <h1 className="font-[Roboto] text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Definir nova senha
              </h1>
              <p className="text-sm text-[#1A1A1A]/60">
                Escolha uma senha forte para a sua conta.
              </p>
            </div>

            <form onSubmit={handleAtualizarSenha} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="novaSenha" className="text-[#1A1A1A]">
                  Nova senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
                  <Input
                    id="novaSenha"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="h-11 border-[#1A1A1A]/15 pl-10 pr-10 focus-visible:ring-[#E2231A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/35 hover:text-[#1A1A1A]/70"
                  >
                    {showSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#1A1A1A]/40">
                  Mínimo de 8 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-[#1A1A1A]">
                  Confirmar nova senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
                  <Input
                    id="confirmarSenha"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="h-11 border-[#1A1A1A]/15 pl-10 focus-visible:ring-[#E2231A]"
                  />
                </div>
              </div>

              {erro && (
                <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
                  {erro}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Atualizar senha'
                )}
              </Button>
            </form>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* ETAPA 4 — CONCLUÍDO */}
        {/* ---------------------------------------------------- */}
        {etapa === 'CONCLUIDO' && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A8F4C]/10">
              <ShieldCheck className="h-7 w-7 text-[#1A8F4C]" />
            </div>
            <h1 className="font-[Roboto] text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Senha atualizada
            </h1>
            <p className="text-sm text-[#1A1A1A]/60">
              A sua senha foi alterada com sucesso. A redirecionar para o
              login...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
