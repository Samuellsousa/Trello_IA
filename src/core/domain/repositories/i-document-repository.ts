import { ProjectDocument, CreateDocumentDTO } from '../entities/document.entity';

export interface IDocumentRepository {
  createDocument(dto: CreateDocumentDTO): Promise<ProjectDocument>;
  listDocuments(boardId: string): Promise<ProjectDocument[]>;
  getDocumentById(id: string): Promise<ProjectDocument | null>;
  deleteDocument(id: string): Promise<boolean>;
  updateDocument(id: string, partial: Partial<ProjectDocument>): Promise<ProjectDocument>;
}
