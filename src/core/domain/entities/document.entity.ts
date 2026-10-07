import { TechItem } from './tech-stack.entity';

export interface ProjectDocument {
  id: string;
  boardId: string;
  title: string;
  fileName: string;
  content: string;
  fileSize: number;
  extractedTechs: TechItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDTO {
  boardId: string;
  title: string;
  fileName: string;
  content: string;
}
