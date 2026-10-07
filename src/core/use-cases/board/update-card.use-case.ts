import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { Card } from '../../domain/entities/card.entity';

export class UpdateCardUseCase {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(cardId: string, partial: Partial<Card>): Promise<Card> {
    return this.boardRepo.updateCard(cardId, partial);
  }
}
