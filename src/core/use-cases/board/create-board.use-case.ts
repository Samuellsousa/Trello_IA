import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { Board, CreateBoardDTO } from '../../domain/entities/board.entity';

export class CreateBoardUseCase {
  constructor(private boardRepository: IBoardRepository) {}

  async execute(dto: CreateBoardDTO): Promise<Board> {
    if (!dto.name || !dto.name.trim()) {
      throw new Error('O nome do projeto é obrigatório.');
    }
    return this.boardRepository.createBoard(dto);
  }
}
