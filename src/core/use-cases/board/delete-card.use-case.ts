import { IBoardRepository } from '../../domain/repositories/i-board-repository';

export class DeleteCardUseCase {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(cardId: string): Promise<boolean> {
    return this.boardRepo.deleteCard(cardId);
  }
}
