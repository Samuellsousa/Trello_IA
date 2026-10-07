export interface BottleneckAlert {
  id: string;
  cardId?: string;
  cardTitle?: string;
  columnId?: string;
  columnTitle?: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

export interface BoardMetrics {
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  backlogCards: number;
  completionPercentage: number;
  storyPointsTotal: number;
  storyPointsCompleted: number;
  storyPointsPercentage: number;
  overdueCardsCount: number;
  nearDeadlineCardsCount: number;
  estimatedHoursTotal: number;
  tagsBreakdown: { tag: string; count: number; color?: string }[];
  priorityBreakdown: { priority: string; count: number }[];
  columnsBreakdown: { columnId: string; title: string; count: number; wipLimit?: number; isWipExceeded: boolean }[];
  bottlenecks: BottleneckAlert[];
}
