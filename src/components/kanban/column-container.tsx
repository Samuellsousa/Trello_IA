'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, AlertTriangle } from 'lucide-react';
import { Column } from '@/core/domain/entities/column.entity';
import { Card } from '@/core/domain/entities/card.entity';
import { CardItem } from './card-item';

interface ColumnContainerProps {
  column: Column;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onAddCardClick: (columnId: string) => void;
  recentlyMovedCardId?: string | null;
}

export function ColumnContainer({
  column,
  cards,
  onCardClick,
  onAddCardClick,
  recentlyMovedCardId,
}: ColumnContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const isWipExceeded = column.wipLimit ? cards.length > column.wipLimit : false;

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 flex flex-col rounded-2xl bg-[#edf4f0] dark:bg-[#0c221a] border transition-all max-h-[calc(100vh-140px)] shadow-sm dark:shadow-none ${
        isOver
          ? 'border-emerald-500/80 bg-[#e3efe7] dark:bg-[#0e2a20] shadow-lg shadow-emerald-500/10'
          : 'border-[#d3e5db] dark:border-[#153a2d]'
      }`}
    >
      {/* Header da Coluna */}
      <div className="p-4 flex items-center justify-between border-b border-[#d3e5db] dark:border-[#153a2d]/80">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 tracking-tight">
            {column.title}
          </h2>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isWipExceeded
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                : 'bg-white dark:bg-[#081a13] text-emerald-900 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'
            }`}
          >
            {cards.length}
            {column.wipLimit ? ` / ${column.wipLimit}` : ''}
          </span>
        </div>

        {/* WIP limit alert */}
        {isWipExceeded && (
          <span
            title={`Limite de trabalho em progresso excedido (${cards.length}/${column.wipLimit})`}
            className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WIP</span>
          </span>
        )}
      </div>

      {/* Lista de Cartões Sortable */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={onCardClick}
              isRecentlyMoved={card.id === recentlyMovedCardId}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="py-8 text-center border border-dashed border-[#c5ddd0] dark:border-[#163c2f] rounded-xl text-xs text-emerald-800/50 dark:text-emerald-400/50">
            Arraste ou crie uma tarefa aqui
          </div>
        )}
      </div>

      {/* Botão Inferior de Adicionar Tarefa */}
      <div className="p-3 border-t border-[#d3e5db] dark:border-[#153a2d]/60">
        <button
          onClick={() => onAddCardClick(column.id)}
          className="w-full py-2 px-3 rounded-lg text-xs font-medium text-emerald-900/70 dark:text-emerald-300/70 hover:text-emerald-950 dark:hover:text-emerald-100 hover:bg-[#dfeee5] dark:hover:bg-[#123326] border border-transparent hover:border-emerald-200/70 dark:hover:border-emerald-800/60 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar cartão</span>
        </button>
      </div>
    </div>
  );
}
