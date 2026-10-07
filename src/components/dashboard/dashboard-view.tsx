'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, SlidersHorizontal, FolderKanban } from 'lucide-react';
import { BoardMetrics } from '@/core/domain/entities/metrics.entity';
import { Board } from '@/core/domain/entities/board.entity';
import { KpiCards } from './kpi-cards';
import { TagsDistributionChart } from './tags-distribution-chart';
import { BottleneckAlerts } from './bottleneck-alerts';
import { Header } from '../layout/header';

export function DashboardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBoardId = searchParams.get('boardId') || 'board-default';

  const [data, setData] = useState<{ board: Board; metrics: BoardMetrics } | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  const fetchMetrics = async (bId: string = activeBoardId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/metrics?boardId=${bId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(activeBoardId);
  }, [activeBoardId]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const list = await res.json();
          setProjects(list.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch (e) {}
    };
    loadProjects();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8faf9] dark:bg-[#071712] transition-colors">
        <Header title="Dashboard Analítico" subtitle="Métricas e Indicadores em Tempo Real" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-emerald-800/80 dark:text-emerald-300/80 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Calculando métricas e diagnósticos...</span>
          </div>
        </div>
      </div>
    );
  }

  const { board, metrics } = data;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8faf9] dark:bg-[#071712] transition-colors duration-200">
      <Header
        title="Dashboard Executivo & Métricas"
        subtitle={`Visão consolidada de desempenho e monitoramento do projeto ${board.name}`}
        techStack={board.techStack}
      />

      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Top Control Bar with Filters */}
        <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center gap-2 text-xs text-emerald-900/80 dark:text-emerald-300/80">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-950 dark:text-emerald-100">Filtros de Monitoramento:</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Project Switcher */}
            {projects.length > 1 && (
              <div className="flex items-center gap-1.5 bg-[#edf5f0] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg px-2.5 py-1">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <select
                  value={activeBoardId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    router.push(`/dashboard?boardId=${newId}`);
                  }}
                  className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Projeto: {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by tag */}
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="bg-[#edf5f0] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">Todas as Tags / Categorias</option>
              {metrics.tagsBreakdown.map((t) => (
                <option key={t.tag} value={t.tag}>
                  #{t.tag} ({t.count})
                </option>
              ))}
            </select>

            {/* Filter by priority */}
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="bg-[#edf5f0] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => fetchMetrics(activeBoardId)}
              className="p-1.5 rounded-lg bg-[#edf5f0] hover:bg-[#e2efe6] dark:bg-[#123326] dark:hover:bg-[#163c2f] text-emerald-900 dark:text-emerald-200 transition-colors"
              title="Atualizar Métricas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. KPI Cards */}
        <KpiCards metrics={metrics} />

        {/* 2. Visual Charts */}
        <TagsDistributionChart
          tagsBreakdown={metrics.tagsBreakdown}
          columnsBreakdown={metrics.columnsBreakdown}
        />

        {/* 3. Bottleneck Alerts */}
        <BottleneckAlerts alerts={metrics.bottlenecks} />
      </main>
    </div>
  );
}
