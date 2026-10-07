'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Sparkles, Plus, Loader2, Filter, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BoardAggregate } from '@/core/domain/entities/board.entity';
import { Card } from '@/core/domain/entities/card.entity';
import { Column } from '@/core/domain/entities/column.entity';
import { PREDEFINED_TASK_CATEGORIES, findCategoryMeta } from '@/core/domain/constants/task-categories';
import { ColumnContainer } from './column-container';
import { CardItem } from './card-item';
import { CardModal } from './card-modal';
import { PromptToCardModal } from './prompt-to-card-modal';
import { Header } from '../layout/header';

interface BoardViewProps {
  initialBoard: BoardAggregate;
}

export function BoardView({ initialBoard }: BoardViewProps) {
  const [board, setBoard] = useState<BoardAggregate>(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isNewManualCardOpen, setIsNewManualCardOpen] = useState(false);
  const [manualTargetColumnId, setManualTargetColumnId] = useState(board.columns[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyMovedCardId, setRecentlyMovedCardId] = useState<string | null>(null);

  const sourceColumnIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const reloadBoard = async () => {
    try {
      const res = await fetch(`/api/board?boardId=${board.id}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    const card = findCard(activeId);
    if (card) {
      setActiveCard(card);
      sourceColumnIdRef.current = card.columnId;
    } else {
      const col = findColumnByCardId(activeId);
      sourceColumnIdRef.current = col ? col.id : null;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByCardId(activeId);
    const overColumn = findColumn(overId) || findColumnByCardId(overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    setBoard((prev) => {
      const activeCards = activeColumn.cards;
      const overCards = overColumn.cards;

      const activeIndex = activeCards.findIndex((c) => c.id === activeId);
      const movingCard = activeCards[activeIndex];
      if (!movingCard) return prev;

      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== activeId),
            };
          }
          if (col.id === overColumn.id) {
            return {
              ...col,
              cards: [...col.cards, { ...movingCard, columnId: overColumn.id }],
            };
          }
          return col;
        }),
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) {
      sourceColumnIdRef.current = null;
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const sourceColId = sourceColumnIdRef.current;
    sourceColumnIdRef.current = null;

    // Coluna final onde o card deve estar
    const overColumn = findColumn(overId) || findColumnByCardId(overId) || findColumnByCardId(activeId);
    if (!overColumn) return;

    // Calcular novo índice de destino
    const isOverAColumnDirectly = overId === overColumn.id;
    let targetIndex = 0;

    if (isOverAColumnDirectly) {
      const curIndex = overColumn.cards.findIndex((c) => c.id === activeId);
      targetIndex = curIndex !== -1 ? curIndex : overColumn.cards.length;
    } else {
      const activeCurrentIndex = overColumn.cards.findIndex((c) => c.id === activeId);
      const overCardIndex = overColumn.cards.findIndex((c) => c.id === overId);

      if (activeCurrentIndex !== -1 && overCardIndex !== -1 && activeCurrentIndex !== overCardIndex) {
        const reordered = arrayMove(overColumn.cards, activeCurrentIndex, overCardIndex);
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === overColumn.id ? { ...col, cards: reordered } : col
          ),
        }));
        targetIndex = overCardIndex;
      } else if (overCardIndex !== -1) {
        targetIndex = overCardIndex;
      } else {
        const curIndex = overColumn.cards.findIndex((c) => c.id === activeId);
        targetIndex = curIndex !== -1 ? curIndex : 0;
      }
    }

    if (targetIndex < 0) targetIndex = 0;

    const isTargetDone = /conclu[ií]d|done|finished/i.test(overColumn.title);
    let targetStatus: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' = 'TODO';
    if (isTargetDone) targetStatus = 'DONE';
    else if (/revis|review|test/i.test(overColumn.title)) targetStatus = 'IN_REVIEW';
    else if (/progress|fazendo|doing/i.test(overColumn.title)) targetStatus = 'IN_PROGRESS';
    else if (/backlog/i.test(overColumn.title)) targetStatus = 'BACKLOG';

    const nowIso = new Date().toISOString();

    // Atualizar status e timestamps do cartão no estado local imediatamente
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id === overColumn.id) {
          return {
            ...col,
            cards: col.cards.map((c) => {
              if (c.id === activeId) {
                return {
                  ...c,
                  columnId: overColumn.id,
                  status: targetStatus,
                  completedAt: isTargetDone ? (c.completedAt || nowIso) : undefined,
                  checklists: isTargetDone ? c.checklists.map((ch) => ({ ...ch, isCompleted: true })) : c.checklists,
                };
              }
              return c;
            }),
          };
        }
        return col;
      }),
    }));

    // Disparar animação visual de transferência
    setRecentlyMovedCardId(activeId);
    setTimeout(() => {
      setRecentlyMovedCardId((curr) => (curr === activeId ? null : curr));
    }, 1200);

    // Comemorar conclusão se transferido para coluna 'Concluído'
    if (isTargetDone && sourceColId !== overColumn.id) {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
        });
      } catch (e) {
        // Canvas fallback silencioso
      }
    }

    // Persistir no backend SEMPRE (sem early returns que cancelem a chamada)
    try {
      const response = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: activeId,
          targetColumnId: overColumn.id,
          newOrder: targetIndex,
        }),
      });

      if (!response.ok) {
        console.error('Erro na resposta ao mover cartão');
        reloadBoard();
      }
    } catch (e) {
      console.error('Falha ao persistir movimentação na API:', e);
      reloadBoard();
    }
  };

  const findCard = (cardId: string): Card | undefined => {
    for (const col of board.columns) {
      const match = col.cards.find((c) => c.id === cardId);
      if (match) return match;
    }
    return undefined;
  };

  const findColumn = (columnId: string): (Column & { cards: Card[] }) | undefined => {
    return board.columns.find((c) => c.id === columnId);
  };

  const findColumnByCardId = (cardId: string): (Column & { cards: Card[] }) | undefined => {
    return board.columns.find((c) => c.cards.some((card) => card.id === cardId));
  };

  // Contagem de cards por categoria no quadro
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const col of board.columns) {
      for (const c of col.cards) {
        counts.all++;
        for (const tag of c.tags) {
          const meta = findCategoryMeta(tag);
          if (meta) {
            counts[meta.name] = (counts[meta.name] || 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [board]);

  // Filtragem combinada (busca textual + categoria selecionada)
  const filteredColumns = useMemo(() => {
    return board.columns.map((col) => {
      let filteredCards = col.cards;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredCards = filteredCards.filter(
          (card) =>
            card.title.toLowerCase().includes(query) ||
            card.description.toLowerCase().includes(query) ||
            card.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      if (selectedCategory) {
        filteredCards = filteredCards.filter((card) =>
          card.tags.some((tag) => {
            const meta = findCategoryMeta(tag);
            return meta
              ? meta.name === selectedCategory
              : tag.toLowerCase() === selectedCategory.toLowerCase();
          })
        );
      }

      return { ...col, cards: filteredCards };
    });
  }, [board.columns, searchQuery, selectedCategory]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8faf9] dark:bg-[#071712] transition-colors duration-200">
      {/* Header */}
      <Header
        title={board.name}
        subtitle={board.description}
        techStack={board.techStack}
        onOpenAiPromptModal={() => setIsPromptModalOpen(true)}
        onOpenNewCardModal={() => {
          setManualTargetColumnId(board.columns[0]?.id || '');
          setIsPromptModalOpen(true);
        }}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Barra de Filtro de Categorias */}
      <div className="px-6 py-2.5 bg-white/70 dark:bg-[#091f17]/70 border-b border-[#dbe8e0] dark:border-[#14372b] flex items-center justify-between gap-4 overflow-x-auto shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950 dark:text-emerald-100 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Categorias:</span>
          </div>

          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              selectedCategory === null
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-[#0c231b] text-slate-600 dark:text-slate-300 border-[#d2e4d8] dark:border-[#153a2d] hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <span>Todas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                selectedCategory === null
                  ? 'bg-emerald-700/80 text-white'
                  : 'bg-[#edf5f0] dark:bg-[#14372b] text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {categoryCounts.all || 0}
            </span>
          </button>

          {PREDEFINED_TASK_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.name] || 0;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? `${cat.activeBgColor} ${cat.activeTextColor} border-transparent shadow-sm ring-1 ring-emerald-500/30`
                    : `${cat.bgColor} ${cat.color} ${cat.borderColor} hover:opacity-90`
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-white/80 dark:bg-black/30 opacity-90'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline shrink-0 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtro</span>
          </button>
        )}
      </div>

      {/* Kanban Board Container */}
      <main className="flex-1 p-6 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-5 h-full pb-4">
            {filteredColumns.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                cards={col.cards}
                onCardClick={(c) => setSelectedCard(c)}
                onAddCardClick={(colId) => {
                  setManualTargetColumnId(colId);
                  setIsPromptModalOpen(true);
                }}
                recentlyMovedCardId={recentlyMovedCardId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? <CardItem card={activeCard} onClick={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Modais */}
      <CardModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        onCardUpdated={reloadBoard}
        onCardDeleted={reloadBoard}
      />

      <PromptToCardModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        columns={board.columns}
        onCardCreated={reloadBoard}
      />
    </div>
  );
}
