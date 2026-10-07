import { Suspense } from 'react';
import { DocHubView } from '@/components/docs/doc-hub-view';

export const metadata = {
  title: 'Documentação & RAG IA — Trello AI',
};

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-emerald-800 dark:text-emerald-300">
          Carregando base de conhecimento...
        </div>
      }
    >
      <DocHubView />
    </Suspense>
  );
}
