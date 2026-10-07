'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, Sparkles, CheckCircle } from 'lucide-react';
import { BottleneckAlert } from '@/core/domain/entities/metrics.entity';

interface BottleneckAlertsProps {
  alerts: BottleneckAlert[];
}

export function BottleneckAlerts({ alerts }: BottleneckAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-6 shadow-sm flex items-center gap-3 text-slate-700 dark:text-slate-300 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">Fluxo Saudável</h4>
          <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60">
            Nenhum gargalo crítico ou estouro de limites WIP identificado pelo motor de monitoramento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/15 border border-emerald-600/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 tracking-tight">
              Diagnóstico do Monitor de Atividades (IA & Regras)
            </h3>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60">
              Identificação de impedimentos, tarefas estagnadas e alertas operacionais.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          {alerts.length} {alerts.length === 1 ? 'Alerta' : 'Alertas'}
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => {
          const isHigh = alert.severity === 'high';
          const isMedium = alert.severity === 'medium';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                isHigh
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                  : isMedium
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isHigh ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                ) : isMedium ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                )}
              </div>

              <div className="flex-1 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {alert.cardTitle ? `Tarefa: "${alert.cardTitle}"` : alert.columnTitle ? `Coluna: "${alert.columnTitle}"` : 'Aviso do Quadro'}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : isMedium
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300">{alert.message}</p>

                {alert.suggestion && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic pt-0.5">
                    💡 Sugestão da IA: {alert.suggestion}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
