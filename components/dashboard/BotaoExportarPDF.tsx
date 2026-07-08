'use client'

// Este componente existe apenas para isolar o @react-pdf/renderer do SSR.
// É importado via dynamic(..., { ssr: false }) na página de relatórios.
// Não usar nenhum import do react-pdf fora deste ficheiro.

import { PDFDownloadLink } from '@react-pdf/renderer'
import { RelatorioSonagas } from '@/components/dashboard/RelatorioSonagas'
import { DadosRelatorio } from '../../app/core/services/relatorio.service'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BotaoExportarPDFProps {
  dados: DadosRelatorio
}

export function BotaoExportarPDF({ dados }: BotaoExportarPDFProps) {
  return (
    <PDFDownloadLink
      document={<RelatorioSonagas dados={dados} />}
      fileName={`relatorio-sonagas-${new Date().toISOString().slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <Button
          disabled={loading}
          className="h-9 gap-1.5 bg-[#E2231A] text-white hover:bg-[#C01D16] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileDown className="h-3.5 w-3.5" />
          )}
          Exportar PDF
        </Button>
      )}
    </PDFDownloadLink>
  )
}
