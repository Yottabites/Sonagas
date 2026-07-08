import { PainelLayout } from '../../../components/layout/painellayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PainelLayout area="dashboard">{children}</PainelLayout>;
}
 