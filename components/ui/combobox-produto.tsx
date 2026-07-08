'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboboxOption {
  id: string
  nome: string
}

interface ComboboxProdutoProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ComboboxProduto({
  options,
  value,
  onValueChange,
  placeholder = 'Escolhe o produto',
  disabled,
  className,
}: ComboboxProdutoProps) {
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selecionado = options.find((o) => o.id === value)

  const opcoesFiltradas = options.filter((o) =>
    o.nome.toLowerCase().includes(filtro.toLowerCase()),
  )

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setAberto(false)
        setFiltro('')
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  function abrir() {
    if (disabled) return
    setAberto(true)
    setIndiceAtivo(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function escolher(opcao: ComboboxOption) {
    onValueChange(opcao.id)
    setAberto(false)
    setFiltro('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!aberto) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        abrir()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceAtivo((i) => Math.min(i + 1, opcoesFiltradas.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceAtivo((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opcao = opcoesFiltradas[indiceAtivo]
      if (opcao) escolher(opcao)
    } else if (e.key === 'Escape') {
      setAberto(false)
      setFiltro('')
    }
  }

  return (
    <div ref={containerRef} className={cn('relative h-11 flex-1', className)}>
      {/* Botão de exibição (fechado) */}
      {!aberto && (
        <button
          type="button"
          disabled={disabled}
          onClick={abrir}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border border-[#1A1A1A]/15 bg-white px-3 text-sm transition',
            'hover:border-[#1A1A1A]/25 disabled:cursor-not-allowed disabled:opacity-50',
            !selecionado && 'text-[#1A1A1A]/40',
          )}
        >
          <span className="truncate">
            {selecionado ? selecionado.nome : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#1A1A1A]/40" />
        </button>
      )}

      {/* Input de filtro (aberto) */}
      {aberto && (
        <input
          ref={inputRef}
          type="text"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value)
            setIndiceAtivo(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder={selecionado?.nome ?? placeholder}
          className="h-11 w-full rounded-md border border-[#E2231A] bg-white px-3 text-sm outline-none ring-2 ring-[#E2231A]/20"
        />
      )}

      {/* Dropdown */}
      {aberto && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-60 overflow-auto rounded-md border border-[#1A1A1A]/10 bg-white py-1 shadow-lg">
          {opcoesFiltradas.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[#1A1A1A]/40">
              Nenhum produto encontrado.
            </p>
          ) : (
            opcoesFiltradas.map((opcao, i) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => escolher(opcao)}
                onMouseEnter={() => setIndiceAtivo(i)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                  i === indiceAtivo
                    ? 'bg-[#E2231A]/10'
                    : 'hover:bg-[#1A1A1A]/5',
                )}
              >
                <span className="truncate">{opcao.nome}</span>
                {opcao.id === value && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#E2231A]" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
