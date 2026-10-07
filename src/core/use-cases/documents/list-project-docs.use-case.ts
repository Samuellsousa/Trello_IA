import { IDocumentRepository } from '../../domain/repositories/i-document-repository';
import { ProjectDocument } from '../../domain/entities/document.entity';

export class ListProjectDocsUseCase {
  constructor(private docRepo: IDocumentRepository) {}

  async execute(boardId: string): Promise<ProjectDocument[]> {
    return this.docRepo.listDocuments(boardId);
  }
}
