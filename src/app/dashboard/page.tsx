import { Suspense } from 'react';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const metadata = {
  title: 'Dashboard & Métricas — Trello AI',
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-emerald-800 dark:text-emerald-300">
          Carregando indicadores...
        </div>
      }
    >
      <DashboardView />
    </Suspense>
  );
}
