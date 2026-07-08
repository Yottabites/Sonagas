'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Simplifika?: {
      open: () => void
      close: () => void
      init: (config: { widgetId: string }) => void
    }
  }
}

const SIMPLIFIKA_WIDGET_ID = process.env.NEXT_PUBLIC_SIMPLIFIKA_WIDGET_ID ?? ''
const SIMPLIFIKA_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_SIMPLIFIKA_SCRIPT_SRC ??
  'https://widget.simplifika.co.ao/embed.js'

/**
 * Carrega o script do widget Simplifika uma única vez e expõe
 * uma função `abrirChat()` para qualquer botão da app poder chamar.
 *
 * Ajusta `window.Simplifika.open()` / `init()` conforme a API real
 * documentada pelo Simplifika — isto assume um padrão comum
 * (tipo Intercom/Crisp), troca se a assinatura deles for diferente.
 */
export function useSimplifikaWidget() {
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (window.Simplifika) {
      setPronto(true)
      return
    }

    const script = document.createElement('script')
    script.src = SIMPLIFIKA_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      window.Simplifika?.init({ widgetId: SIMPLIFIKA_WIDGET_ID })
      setPronto(true)
    }
    document.body.appendChild(script)

    return () => {
      // mantemos o script entre navegações (não remover),
      // só limpamos se quiseres desmontar completamente:
      // document.body.removeChild(script);
    }
  }, [])

  function abrirChat() {
    if (window.Simplifika) {
      window.Simplifika.open()
    } else {
      console.warn('Widget Simplifika ainda não carregou.')
    }
  }

  return { pronto, abrirChat }
}
