import { Column } from './column.entity';
import { Card } from './card.entity';
import { ProjectTechStack } from './tech-stack.entity';

export interface Board {
  id: string;
  name: string;
  description: string;
  colorTheme: string;
  techStack: ProjectTechStack;
  createdAt: string;
  updatedAt: string;
}

export interface BoardAggregate extends Board {
  columns: (Column & { cards: Card[] })[];
}

export interface CreateBoardDTO {
  name: string;
  description?: string;
  colorTheme?: string;
  initialTechs?: string[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  colorTheme: string;
  techStack: ProjectTechStack;
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  todoCards: number;
  completionPercentage: number;
  totalEstimatedHours: number;
  totalStoryPoints: number;
  categories: string[];
  docsCount: number;
  createdAt: string;
  updatedAt: string;
}
