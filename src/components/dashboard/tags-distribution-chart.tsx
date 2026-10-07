'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

interface TagsDistributionChartProps {
  tagsBreakdown: { tag: string; count: number }[];
  columnsBreakdown: { columnId: string; title: string; count: number; wipLimit?: number }[];
}

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#0d9488', '#14b8a6', '#0284c7'];

export function TagsDistributionChart({
  tagsBreakdown,
  columnsBreakdown,
}: TagsDistributionChartProps) {
  const pieData = tagsBreakdown.slice(0, 6).map((item, idx) => ({
    name: item.tag,
    value: item.count,
    color: COLORS[idx % COLORS.length],
  }));

  const barData = columnsBreakdown.map((col) => ({
    name: col.title,
    tarefas: col.count,
    wip: col.wipLimit || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Categorias / Tags (Donut Chart) */}
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm flex flex-col transition-colors">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 tracking-tight mb-1">
          Distribuição por Categorias & Tags
        </h3>
        <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60 mb-4">
          Volume de atividades agrupadas por área técnica e etiquetas.
        </p>

        {pieData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#081a13',
                    borderColor: '#163a2d',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-emerald-800/50 dark:text-emerald-400/50">
            Nenhuma tag cadastrada ainda.
          </div>
        )}
      </div>

      {/* 2. Carga por Coluna / WIP Limits (Bar Chart) */}
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl p-5 shadow-sm flex flex-col transition-colors">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 tracking-tight mb-1">
          Fluxo e Ocupação de Colunas
        </h3>
        <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60 mb-4">
          Volume de cartões em cada etapa do fluxo de trabalho.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#163a2d33" vertical={false} />
              <XAxis dataKey="name" stroke="#5c997e" fontSize={11} tickLine={false} />
              <YAxis stroke="#5c997e" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#081a13',
                  borderColor: '#163a2d',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="tarefas" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
