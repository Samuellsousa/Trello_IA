'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  TrendingUp, 
} from 'lucide-react';
import { BoardMetrics } from '@/core/domain/entities/metrics.entity';

interface KpiCardsProps {
  metrics: BoardMetrics;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Taxa de Conclusão */}
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-300/70 uppercase tracking-wider">
            Taxa de Conclusão
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
            {metrics.completionPercentage}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({metrics.completedCards}/{metrics.totalCards} tarefas)
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#edf5f0] dark:bg-[#081a13] rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${metrics.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Story Points & Esforço */}
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-300/70 uppercase tracking-wider">
            Story Points Entregues
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
            {metrics.storyPointsPercentage}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({metrics.storyPointsCompleted}/{metrics.storyPointsTotal} SP)
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#edf5f0] dark:bg-[#081a13] rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${metrics.storyPointsPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Tempo & Horas Estimadas */}
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-300/70 uppercase tracking-wider">
            Carga de Trabalho
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50 tracking-tight">
            {metrics.estimatedHoursTotal}h
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {metrics.inProgressCards} em andamento
          </span>
        </div>
        <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70 mt-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {metrics.backlogCards} tarefas aguardando no backlog
        </p>
      </div>

      {/* 4. Saúde & Alertas */}
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-300/70 uppercase tracking-wider">
            Atenção & Prazos
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              metrics.overdueCardsCount > 0
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold tracking-tight ${
              metrics.overdueCardsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-950 dark:text-emerald-50'
            }`}
          >
            {metrics.overdueCardsCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">atrasadas</span>
        </div>
        <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70 mt-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {metrics.nearDeadlineCardsCount} próximas do vencimento (48h)
        </p>
      </div>
    </div>
  );
}
