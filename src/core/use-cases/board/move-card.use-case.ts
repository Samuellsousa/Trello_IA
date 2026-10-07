import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { Card } from '../../domain/entities/card.entity';

export class MoveCardUseCase {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(cardId: string, targetColumnId: string, newOrder: number): Promise<Card> {
    return this.boardRepo.moveCard(cardId, targetColumnId, newOrder);
  }
}
