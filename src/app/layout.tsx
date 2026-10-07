import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { ThemeProvider } from '@/components/theme/theme-provider';

export const metadata: Metadata = {
  title: 'Trello AI — Kanban Inteligente & Monitoramento',
  description: 'Gestão visual de projetos com Inteligência Artificial, RAG de documentação .md e Dashboard Analítico.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('trello-ai-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <Suspense fallback={<aside className="w-64 bg-[#eef6f2] dark:bg-[#0c221a] border-r border-[#d5e7dd] dark:border-[#14372b] h-screen" />}>
            <Sidebar />
          </Suspense>
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
