import { CreateCardDTO } from '../entities/card.entity';
import { TechItem } from '../entities/tech-stack.entity';
import { ProjectDocument } from '../entities/document.entity';
import { BoardAggregate } from '../entities/board.entity';
import { BottleneckAlert } from '../entities/metrics.entity';

export interface AiGeneratedCardResult {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  estimatedHours: number;
  storyPoints: number;
  suggestedColumnTitle?: string;
  checklists: { title: string; isCompleted: boolean }[];
  rationale?: string;
}

export interface AiDocQueryResponse {
  answer: string;
  citedSections: string[];
  suggestedCards?: Array<{ title: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>;
}

export interface IAiService {
  generateCardFromPrompt(
    prompt: string, 
    context?: { boardName?: string; existingTags?: string[]; techStack?: string[] }
  ): Promise<AiGeneratedCardResult>;

  extractTechStackFromMarkdown(
    markdownContent: string, 
    fileName?: string
  ): Promise<TechItem[]>;

  queryDocumentAssistant(
    question: string, 
    docs: ProjectDocument[], 
    boardContext?: BoardAggregate
  ): Promise<AiDocQueryResponse>;

  analyzeBoardHealth(board: BoardAggregate): Promise<BottleneckAlert[]>;
}
