'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  LifeBuoy,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from './core/hooks/useLogin'

export default function LoginSonagas() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const { mutate: login, isPending, error } = useLogin()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    login({ email, senha })
  }

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAF8] font-[Inter]">
      {/* ---------------------------------------------------- */}
      {/* PAINEL INSTITUCIONAL (esquerda) — imagem de fundo */}
      {/* ---------------------------------------------------- */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <Image
          src="/background.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/80 via-[#1A1A1A]/55 to-[#1A1A1A]/85" />

        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/sonagas.png"
            alt="Sonagás Energias Renováveis"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <span className="inline-block font-[Roboto] text-xs font-bold uppercase tracking-[0.25em] text-[#FFC20E]">
            Sonagás · Grupo Sonangol
          </span>
          <h1 className="font-[Roboto] text-4xl font-bold leading-[1.15] tracking-tight text-white">
            Gestão integrada do Gás e das Energias Renováveis de Angola.
          </h1>
          <p className="text-sm leading-relaxed text-white/75">
            Plataforma corporativa para gestão de licenças, estoque,
            distribuição de agentes e relatórios estratégicos.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#FFC20E]" />
          <span className="h-2 w-2 rounded-full bg-[#E2231A]" />
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
            Energia · Continuidade · Confiança
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PAINEL DE LOGIN (direita) */}
      {/* ---------------------------------------------------- */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center lg:hidden">
            <Image
              src="/sonagas.png"
              alt="Sonagás Energias Renováveis"
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          <div className="mb-8 space-y-1.5 text-center lg:text-left">
            <h2 className="font-[Roboto] text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Acesso à plataforma
            </h2>
            <p className="text-sm text-[#1A1A1A]/60">
              Introduza as suas credenciais para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1A1A1A]">
                Email institucional
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
                <Input
                  id="email"
                  name="email"
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="text-[#1A1A1A]">
                  Senha
                </Label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs font-medium text-[#E2231A] underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 border-[#1A1A1A]/15 pl-10 pr-10 focus-visible:ring-[#E2231A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/35 hover:text-[#1A1A1A]/70"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
                {error.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#1A1A1A]/10" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-[#1A1A1A]/40">
              Precisa de ajuda?
            </span>
            <span className="h-px flex-1 bg-[#1A1A1A]/10" />
          </div>

          <Link
            href="/suporte"
            className="flex items-center justify-center gap-2 rounded-md border border-[#1A1A1A]/10 px-4 py-2.5 text-sm font-medium text-[#1A1A1A]/80 transition hover:border-[#FFC20E] hover:bg-[#FFC20E]/10 hover:text-[#1A1A1A]"
          >
            <LifeBuoy className="h-4 w-4" />
            Contactar suporte
          </Link>

          <p className="mt-10 text-center text-[11px] text-[#1A1A1A]/40">
            © {new Date().getFullYear()} Sonagás — Grupo Sonangol. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
