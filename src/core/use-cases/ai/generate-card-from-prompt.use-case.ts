import { IAiService } from '../../domain/repositories/i-ai-service';
import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { Card } from '../../domain/entities/card.entity';

export class GenerateCardFromPromptUseCase {
  constructor(
    private aiService: IAiService,
    private boardRepo: IBoardRepository
  ) {}

  async execute(params: {
    prompt: string;
    boardId: string;
    targetColumnId?: string;
    autoCreate?: boolean;
  }): Promise<{ preview: any; createdCard?: Card }> {
    const board = await this.boardRepo.getBoardAggregate(params.boardId);
    if (!board) {
      throw new Error('Board não encontrado.');
    }

    const existingTags = Array.from(
      new Set(board.columns.flatMap((c) => c.cards.flatMap((card) => card.tags)))
    );

    const techStackNames = [
      ...board.techStack.languages.map((t) => t.name),
      ...board.techStack.frameworks.map((t) => t.name),
      ...board.techStack.databases.map((t) => t.name),
      ...board.techStack.devops.map((t) => t.name),
      ...board.techStack.libraries.map((t) => t.name),
    ];

    const generated = await this.aiService.generateCardFromPrompt(params.prompt, {
      boardName: board.name,
      existingTags,
      techStack: techStackNames,
    });

    let createdCard: Card | undefined;

    if (params.autoCreate) {
      // Determina a coluna de destino
      let colId = params.targetColumnId;
      if (!colId) {
        // Tenta achar a coluna sugerida ou pega a primeira coluna (backlog/a fazer)
        const matchCol = board.columns.find(
          (c) =>
            generated.suggestedColumnTitle &&
            c.title.toLowerCase().includes(generated.suggestedColumnTitle.toLowerCase())
        );
        colId = matchCol ? matchCol.id : board.columns[0]?.id;
      }

      if (colId) {
        createdCard = await this.boardRepo.createCard({
          boardId: params.boardId,
          columnId: colId,
          title: generated.title,
          description: generated.description,
          priority: generated.priority,
          tags: generated.tags,
          estimatedHours: generated.estimatedHours,
          storyPoints: generated.storyPoints,
          checklists: generated.checklists,
        });
      }
    }

    return {
      preview: generated,
      createdCard,
    };
  }
}
