import { BoardAggregate } from '../../domain/entities/board.entity';
import { BoardMetrics, BottleneckAlert } from '../../domain/entities/metrics.entity';

export class CalculateBoardMetricsUseCase {
  execute(board: BoardAggregate, aiBottlenecks: BottleneckAlert[] = []): BoardMetrics {
    const allCards = board.columns.flatMap((col) => col.cards);
    const totalCards = allCards.length;

    // Colunas identificadas pelo título (insensível a maiúsculas)
    const completedColumn = board.columns.find((c) =>
      /conclu[ií]d|done|finished|entregue/i.test(c.title)
    );
    const inProgressColumn = board.columns.find((c) =>
      /progresso|progress|fazendo|doing|desenvolvimento/i.test(c.title)
    );
    const backlogColumn = board.columns.find((c) =>
      /backlog|a fazer|to do|pendente/i.test(c.title)
    );

    const completedCards = completedColumn ? completedColumn.cards.length : 0;
    const inProgressCards = inProgressColumn ? inProgressColumn.cards.length : 0;
    const backlogCards = backlogColumn ? backlogColumn.cards.length : 0;

    const completionPercentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

    // Story Points
    const storyPointsTotal = allCards.reduce((acc, card) => acc + (card.storyPoints || 0), 0);
    const completedCardsList = completedColumn ? completedColumn.cards : [];
    const storyPointsCompleted = completedCardsList.reduce((acc, card) => acc + (card.storyPoints || 0), 0);
    const storyPointsPercentage = storyPointsTotal > 0 ? Math.round((storyPointsCompleted / storyPointsTotal) * 100) : 0;

    // Horas estimadas
    const estimatedHoursTotal = allCards.reduce((acc, card) => acc + (card.estimatedHours || 0), 0);

    // Prazos
    const now = new Date();
    let overdueCardsCount = 0;
    let nearDeadlineCardsCount = 0;

    const deterministicBottlenecks: BottleneckAlert[] = [];

    allCards.forEach((card) => {
      if (card.dueDate && !completedCardsList.some(c => c.id === card.id)) {
        const due = new Date(card.dueDate);
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 0) {
          overdueCardsCount++;
          deterministicBottlenecks.push({
            id: `overdue-${card.id}`,
            cardId: card.id,
            cardTitle: card.title,
            severity: 'high',
            message: `Tarefa em atraso desde ${due.toLocaleDateString('pt-BR')}`,
            suggestion: 'Repriorizar, realocar responsável ou atualizar prazo estimado.',
          });
        } else if (diffDays <= 2) {
          nearDeadlineCardsCount++;
        }
      }
    });

    // Tags breakdown
    const tagMap = new Map<string, number>();
    allCards.forEach((card) => {
      card.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    const tagsBreakdown = Array.from(tagMap.entries()).map(([tag, count]) => ({
      tag,
      count,
    })).sort((a, b) => b.count - a.count);

    // Prioridades breakdown
    const priorityMap = new Map<string, number>();
    allCards.forEach((card) => {
      priorityMap.set(card.priority, (priorityMap.get(card.priority) || 0) + 1);
    });
    const priorityBreakdown = Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));

    // Colunas breakdown e WIP limits
    const columnsBreakdown = board.columns.map((col) => {
      const count = col.cards.length;
      const isWipExceeded = Boolean(col.wipLimit && count > col.wipLimit);
      if (isWipExceeded) {
        deterministicBottlenecks.push({
          id: `wip-${col.id}`,
          columnId: col.id,
          columnTitle: col.title,
          severity: 'medium',
          message: `Coluna "${col.title}" excedeu o limite WIP (${count}/${col.wipLimit} tarefas).`,
          suggestion: 'Conclua tarefas em andamento antes de puxar novos itens para a coluna.',
        });
      }
      return {
        columnId: col.id,
        title: col.title,
        count,
        wipLimit: col.wipLimit,
        isWipExceeded,
      };
    });

    // Unir gargalos determinísticos com os da IA
    const bottlenecks = [...deterministicBottlenecks, ...aiBottlenecks];

    return {
      totalCards,
      completedCards,
      inProgressCards,
      backlogCards,
      completionPercentage,
      storyPointsTotal,
      storyPointsCompleted,
      storyPointsPercentage,
      overdueCardsCount,
      nearDeadlineCardsCount,
      estimatedHoursTotal,
      tagsBreakdown,
      priorityBreakdown,
      columnsBreakdown,
      bottlenecks,
    };
  }
}
