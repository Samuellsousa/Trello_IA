import { IAiService, AiDocQueryResponse } from '../../domain/repositories/i-ai-service';
import { IDocumentRepository } from '../../domain/repositories/i-document-repository';
import { IBoardRepository } from '../../domain/repositories/i-board-repository';

export class QueryDocumentAssistantUseCase {
  constructor(
    private aiService: IAiService,
    private docRepo: IDocumentRepository,
    private boardRepo: IBoardRepository
  ) {}

  async execute(params: {
    boardId: string;
    question: string;
  }): Promise<AiDocQueryResponse> {
    const docs = await this.docRepo.listDocuments(params.boardId);
    const board = await this.boardRepo.getBoardAggregate(params.boardId);

    return this.aiService.queryDocumentAssistant(
      params.question,
      docs,
      board || undefined
    );
  }
}
