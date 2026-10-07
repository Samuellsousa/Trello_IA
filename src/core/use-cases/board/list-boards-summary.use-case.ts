import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { ProjectSummary } from '../../domain/entities/board.entity';

export class ListBoardsSummaryUseCase {
  constructor(private boardRepository: IBoardRepository) {}

  async execute(): Promise<ProjectSummary[]> {
    return this.boardRepository.listProjectsSummary();
  }
}
