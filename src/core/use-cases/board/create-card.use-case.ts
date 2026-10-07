import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { Card, CreateCardDTO } from '../../domain/entities/card.entity';

export class CreateCardUseCase {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(dto: CreateCardDTO): Promise<Card> {
    if (!dto.title || dto.title.trim() === '') {
      throw new Error('O título da tarefa é obrigatório.');
    }
    return this.boardRepo.createCard(dto);
  }
}
