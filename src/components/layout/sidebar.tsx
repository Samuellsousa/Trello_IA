'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  Kanban, 
  BarChart3, 
  FileCode2, 
  Cpu, 
  Layers,
  Compass,
  Boxes,
  ArrowLeft,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';
import { ThemeToggle } from '../theme/theme-toggle';

interface ProjectOption {
  id: string;
  name: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<ProjectOption[]>([]);

  // Carregar lista de projetos para navegação rápida
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProjects(data.map((p: any) => ({ id: p.id, name: p.name })));
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Identificar board ativo a partir da rota atual
  let activeBoardId = 'board-default';
  if (pathname.startsWith('/board/')) {
    activeBoardId = pathname.split('/board/')[1]?.split('/')[0] || 'board-default';
  } else if (searchParams.get('boardId')) {
    activeBoardId = searchParams.get('boardId')!;
  } else if (projects.length > 0) {
    activeBoardId = projects[0].id;
  }

  const isHubActive = pathname === '/';
  const isKanbanActive = pathname.startsWith('/board/');
  const isDashboardActive = pathname === '/dashboard';
  const isDocsActive = pathname === '/docs';

  const currentProjectName =
    projects.find((p) => p.id === activeBoardId)?.name || 'Projeto Atual';

  return (
    <aside className="w-64 bg-[#eef6f2] dark:bg-[#0c221a] border-r border-[#d5e7dd] dark:border-[#14372b] flex flex-col h-screen shrink-0 sticky top-0 backdrop-blur-md z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#d5e7dd] dark:border-[#14372b] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-semibold shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-emerald-950 dark:text-emerald-100 tracking-tight text-sm flex items-center gap-1.5">
              Trello AI <span className="text-[10px] bg-emerald-600/10 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300 font-medium px-1.5 py-0.2 rounded border border-emerald-600/20 dark:border-emerald-400/25">Flow</span>
            </h1>
            <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/60">Kanban & Inteligência</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="p-3.5 space-y-4 flex-1 overflow-y-auto">
        {/* Hub Principal */}
        <div className="space-y-1">
          <Link
            href="/"
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isHubActive
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-950 dark:text-emerald-100 hover:bg-[#dfeee5] dark:hover:bg-[#123025]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className={`w-4 h-4 ${isHubActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}`} />
              <span>Todos os Projetos</span>
            </div>
            {projects.length > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isHubActive
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-200/70 dark:bg-[#153a2d] text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {projects.length}
              </span>
            )}
          </Link>
        </div>

        {/* Contexto do Projeto Ativo */}
        <div className="pt-2 border-t border-[#d8eade] dark:border-[#14372b]/70 space-y-2">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-emerald-800/60 dark:text-emerald-400/50 uppercase">
              Projeto Ativo
            </span>
            {!isHubActive && (
              <Link
                href="/"
                className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                <ArrowLeft className="w-2.5 h-2.5" />
                <span>Trocar</span>
              </Link>
            )}
          </div>

          {/* Card Seletor do Projeto */}
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0e271e] border border-[#d5e7dd] dark:border-[#184233] space-y-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-[#153a2d] text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <FolderKanban className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-100 truncate">
                {currentProjectName}
              </span>
            </div>

            {projects.length > 1 && (
              <select
                value={activeBoardId}
                onChange={(e) => {
                  const newId = e.target.value;
                  if (pathname.startsWith('/board/')) {
                    router.push(`/board/${newId}`);
                  } else if (pathname === '/dashboard') {
                    router.push(`/dashboard?boardId=${newId}`);
                  } else if (pathname === '/docs') {
                    router.push(`/docs?boardId=${newId}`);
                  } else {
                    router.push(`/board/${newId}`);
                  }
                }}
                className="w-full text-[11px] bg-[#edf5f0] dark:bg-[#071812] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Links do Projeto Específico */}
          <div className="space-y-1 pt-1">
            <Link
              href={`/board/${activeBoardId}`}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isKanbanActive
                  ? 'bg-emerald-700 dark:bg-emerald-600/40 text-white dark:text-emerald-100 shadow-sm font-semibold'
                  : 'text-emerald-900/80 dark:text-emerald-200/70 hover:bg-[#dfeee5] dark:hover:bg-[#123025]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className={`w-4 h-4 ${isKanbanActive ? 'text-white' : 'text-emerald-700/80 dark:text-emerald-400/70'}`} />
                <span>Quadro Kanban</span>
              </div>
            </Link>

            <Link
              href={`/dashboard?boardId=${activeBoardId}`}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isDashboardActive
                  ? 'bg-emerald-700 dark:bg-emerald-600/40 text-white dark:text-emerald-100 shadow-sm font-semibold'
                  : 'text-emerald-900/80 dark:text-emerald-200/70 hover:bg-[#dfeee5] dark:hover:bg-[#123025]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${isDashboardActive ? 'text-white' : 'text-emerald-700/80 dark:text-emerald-400/70'}`} />
                <span>Dashboard & Métricas</span>
              </div>
            </Link>

            <Link
              href={`/docs?boardId=${activeBoardId}`}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isDocsActive
                  ? 'bg-emerald-700 dark:bg-emerald-600/40 text-white dark:text-emerald-100 shadow-sm font-semibold'
                  : 'text-emerald-900/80 dark:text-emerald-200/70 hover:bg-[#dfeee5] dark:hover:bg-[#123025]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCode2 className={`w-4 h-4 ${isDocsActive ? 'text-white' : 'text-emerald-700/80 dark:text-emerald-400/70'}`} />
                <span>Documentos & IA (.md)</span>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  isDocsActive
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-100/80 dark:bg-[#123025] text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-700/40'
                }`}
              >
                RAG
              </span>
            </Link>
          </div>
        </div>

        {/* Assistente Ativo Info */}
        <div className="pt-2">
          <div className="p-3 rounded-xl bg-white/70 dark:bg-[#0f291f] border border-[#d5e7dd] dark:border-[#1a4435] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>RAG & Parser .md</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-emerald-900/70 dark:text-emerald-200/60 leading-relaxed">
              Leitura de especificações .md e apoio cognitivo contextual.
            </p>
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#d5e7dd] dark:border-[#14372b] text-[11px] text-emerald-800/70 dark:text-emerald-300/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Clean Architecture</span>
        </div>
        <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-mono">
          v2.0
        </span>
      </div>
    </aside>
  );
}
