'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  CheckCircle2,
  Zap,
  RotateCcw,
  Package,
  FileText,
  Layout,
  Server,
  Database,
  Rocket,
  Cpu,
  Layers,
  Tag
} from 'lucide-react';
import { Card, PriorityLevel, CardStatus } from '@/core/domain/entities/card.entity';
import { findCategoryMeta } from '@/core/domain/constants/task-categories';

const CATEGORY_ICON_MAP: Record<string, any> = {
  FileText,
  Layout,
  Server,
  Database,
  Rocket,
  Cpu,
  CheckCircle: CheckCircle2,
  Layers,
};

interface CardItemProps {
  card: Card;
  onClick: (card: Card) => void;
  isRecentlyMoved?: boolean;
}

const PRIORITY_STYLES: Record<PriorityLevel, { label: string; bg: string; text: string; dot: string }> = {
  urgent: { 
    label: 'Urgente', 
    bg: 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-500/10 dark:border-rose-500/30', 
    text: 'text-rose-600 dark:text-rose-400', 
    dot: 'bg-rose-500' 
  },
  high: { 
    label: 'Alta', 
    bg: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/30', 
    text: 'text-amber-600 dark:text-amber-400', 
    dot: 'bg-amber-500' 
  },
  medium: { 
    label: 'Média', 
    bg: 'bg-sky-500/10 border-sky-500/30 dark:bg-sky-500/10 dark:border-sky-500/30', 
    text: 'text-sky-600 dark:text-sky-400', 
    dot: 'bg-sky-500' 
  },
  low: { 
    label: 'Baixa', 
    bg: 'bg-slate-500/10 border-slate-500/30 dark:bg-slate-500/10 dark:border-slate-500/30', 
    text: 'text-slate-600 dark:text-slate-400', 
    dot: 'bg-slate-400' 
  },
};

const STATUS_META: Record<CardStatus, { label: string; color: string; icon: any }> = {
  DONE: { label: 'Concluído', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'Em Progresso', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', icon: Zap },
  IN_REVIEW: { label: 'Revisão', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30', icon: RotateCcw },
  TODO: { label: 'A Fazer', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Clock },
  BACKLOG: { label: 'Backlog', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30', icon: Package },
};

export function CardItem({ card, onClick, isRecentlyMoved = false }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityMeta = PRIORITY_STYLES[card.priority] || PRIORITY_STYLES.medium;
  const statusMeta = card.status ? STATUS_META[card.status] : undefined;
  const StatusIcon = statusMeta?.icon;

  const totalChecklists = card.checklists.length;
  const completedChecklists = card.checklists.filter((c) => c.isCompleted).length;

  const isOverdue = card.dueDate ? new Date(card.dueDate).getTime() < Date.now() : false;
  const isDone = card.status === 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(card)}
      className={`group relative bg-white dark:bg-[#0c231b] hover:bg-[#fbfdfc] dark:hover:bg-[#0e281f] border rounded-xl p-3.5 shadow-sm transition-all cursor-pointer ${
        isDragging
          ? 'opacity-40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-2xl scale-[1.02]'
          : isRecentlyMoved
          ? isDone
            ? 'animate-card-done ring-2 ring-emerald-500/80 shadow-lg shadow-emerald-500/20'
            : 'animate-card-transfer ring-2 ring-emerald-500/80 shadow-lg shadow-emerald-500/20'
          : 'border-[#dbe8e0] dark:border-[#153a2d] hover:border-emerald-300/80 dark:hover:border-emerald-700/80 hover:shadow-md'
      }`}
    >
      {/* Top row: Priority, Status Badge and Story Points */}
      <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityMeta.bg} ${priorityMeta.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
            {priorityMeta.label}
          </span>

          {statusMeta && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusMeta.color} transition-all duration-300`}
            >
              {StatusIcon && <StatusIcon className="w-2.5 h-2.5" />}
              {statusMeta.label}
            </span>
          )}
        </div>

        {card.storyPoints ? (
          <span className="text-[10px] font-semibold text-emerald-900/80 dark:text-emerald-300/80 bg-[#edf5f0] dark:bg-[#081a13] px-1.5 py-0.5 rounded border border-[#d2e4d8] dark:border-[#163a2d]">
            {card.storyPoints} SP
          </span>
        ) : null}
      </div>

      {/* Card Title */}
      <h3
        className={`text-sm font-medium transition-colors line-clamp-2 leading-snug ${
          isDone
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
        }`}
      >
        {card.title}
      </h3>

      {/* Categorias & Tags */}
      {card.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          {card.tags.slice(0, 4).map((tag, idx) => {
            const cat = findCategoryMeta(tag);
            if (cat) {
              const IconComponent = CATEGORY_ICON_MAP[cat.iconName] || Tag;
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
                >
                  <IconComponent className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>{cat.name}</span>
                </span>
              );
            }
            return (
              <span
                key={idx}
                className="text-[10px] bg-[#edf5f0] dark:bg-[#0e2a20] text-emerald-900/90 dark:text-emerald-300 border border-[#d2e4d8] dark:border-[#163c2f] px-2 py-0.5 rounded-md font-medium"
              >
                #{tag}
              </span>
            );
          })}
          {card.tags.length > 4 && (
            <span className="text-[10px] text-emerald-800/60 dark:text-emerald-400/60 font-medium">
              +{card.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer Info: Due date, checklist, estimated hours */}
      <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[#edf4f0] dark:border-[#14372b]/70 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2.5">
          {card.dueDate && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue && !isDone
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          )}

          {totalChecklists > 0 && (
            <span
              className={`flex items-center gap-1 font-medium ${
                completedChecklists === totalChecklists ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              {completedChecklists}/{totalChecklists}
            </span>
          )}
        </div>

        {card.estimatedHours ? (
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            {card.estimatedHours}h
          </span>
        ) : null}
      </div>
    </div>
  );
}
