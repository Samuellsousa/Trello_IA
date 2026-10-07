import { IAiService } from '../../domain/repositories/i-ai-service';
import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { BottleneckAlert } from '../../domain/entities/metrics.entity';

export class AnalyzeBoardBottlenecksUseCase {
  constructor(
    private aiService: IAiService,
    private boardRepo: IBoardRepository
  ) {}

  async execute(boardId: string): Promise<BottleneckAlert[]> {
    const board = await this.boardRepo.getBoardAggregate(boardId);
    if (!board) {
      throw new Error('Board não encontrado.');
    }
    return this.aiService.analyzeBoardHealth(board);
  }
}
