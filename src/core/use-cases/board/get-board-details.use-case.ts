import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { BoardAggregate } from '../../domain/entities/board.entity';

export class GetBoardDetailsUseCase {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(boardId: string): Promise<BoardAggregate | null> {
    return this.boardRepo.getBoardAggregate(boardId);
  }
}
