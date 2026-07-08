import { PainelLayout } from '../../../components/layout/painellayout'

export default function RevendedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PainelLayout area="revendedor">{children}</PainelLayout>
}
