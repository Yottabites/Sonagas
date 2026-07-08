'use client'

import { useState, useMemo } from 'react'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from '@react-google-maps/api'
import { FiscalizacaoResumo } from '../../app/core/services/fiscalizacao.service'

// Centro padrão: Luanda, Angola
const CENTRO_PADRAO = { lat: -8.838333, lng: 13.234444 }

interface MapaFiscalizacoesProps {
  pings: FiscalizacaoResumo[]
  altura?: string
}

export function MapaFiscalizacoes({
  pings,
  altura = '360px',
}: MapaFiscalizacoesProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  })

  const [pingAberto, setPingAberto] = useState<string | null>(null)

  const pingsComLocalizacao = useMemo(
    () => pings.filter((p) => p.latitude !== null && p.longitude !== null),
    [pings],
  )

  const centro = useMemo(() => {
    if (pingsComLocalizacao.length === 0) return CENTRO_PADRAO
    return {
      lat: pingsComLocalizacao[0].latitude as number,
      lng: pingsComLocalizacao[0].longitude as number,
    }
  }, [pingsComLocalizacao])

  if (!isLoaded) {
    return (
      <div
        className="isolate flex items-center justify-center rounded-md border border-[#1A1A1A]/10 bg-[#1A1A1A]/[0.02]"
        style={{ height: altura }}
      >
        <p className="text-sm text-[#1A1A1A]/40">A carregar mapa...</p>
      </div>
    )
  }

  return (
    <div
      // "isolate" mantém qualquer z-index interno do Google Maps
      // (controlos, infowindows) contido nesta div — nunca sobrepõe o Sheet.
      className="isolate overflow-hidden rounded-md border border-[#1A1A1A]/10"
      style={{ height: altura }}
    >
      <GoogleMap
        center={centro}
        zoom={pingsComLocalizacao.length > 0 ? 9 : 6}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {pingsComLocalizacao.map((ping) => (
          <Marker
            key={ping.id}
            position={{
              lat: ping.latitude as number,
              lng: ping.longitude as number,
            }}
            icon={{
              url: ping.conforme
                ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            onClick={() => setPingAberto(ping.id)}
          >
            {pingAberto === ping.id && (
              <InfoWindow onCloseClick={() => setPingAberto(null)}>
                <div className="p-1">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {ping.agente.nome}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">
                    Licença {ping.licenca.numero}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">
                    {ping.conforme ? 'Conforme' : 'Não conforme'} ·{' '}
                    {new Date(ping.dataFiscalizacao).toLocaleDateString(
                      'pt-PT',
                    )}
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  )
}
