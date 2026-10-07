export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type CardStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CardComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: CardStatus;
  completedAt?: string;
  tags: string[];
  dueDate?: string;
  estimatedHours?: number;
  storyPoints?: number;
  order: number;
  checklists: ChecklistItem[];
  comments: CardComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardDTO {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: PriorityLevel;
  status?: CardStatus;
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
  storyPoints?: number;
  checklists?: Array<{ title: string; isCompleted?: boolean }>;
}
