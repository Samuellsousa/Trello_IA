import { IAiService } from '../../domain/repositories/i-ai-service';
import { IBoardRepository } from '../../domain/repositories/i-board-repository';
import { ProjectTechStack, TechItem } from '../../domain/entities/tech-stack.entity';

export class ExtractTechStackFromMdUseCase {
  constructor(
    private aiService: IAiService,
    private boardRepo: IBoardRepository
  ) {}

  async execute(params: {
    markdownContent: string;
    boardId: string;
    fileName?: string;
    applyToBoard?: boolean;
  }): Promise<{ extracted: TechItem[]; updatedTechStack?: ProjectTechStack }> {
    const board = await this.boardRepo.getBoardAggregate(params.boardId);
    if (!board) {
      throw new Error('Board não encontrado.');
    }

    const detectedItems = await this.aiService.extractTechStackFromMarkdown(
      params.markdownContent,
      params.fileName
    );

    let updatedTechStack: ProjectTechStack | undefined;

    if (params.applyToBoard) {
      // Mesclar de forma idempotente sem duplicar
      const currentStack = board.techStack || {
        languages: [],
        frameworks: [],
        databases: [],
        devops: [],
        libraries: [],
        tools: [],
      };

      const mergeCategory = (current: TechItem[], incoming: TechItem[]) => {
        const map = new Map<string, TechItem>();
        current.forEach((item) => map.set(item.name.toLowerCase(), item));
        incoming.forEach((item) => {
          if (!map.has(item.name.toLowerCase())) {
            map.set(item.name.toLowerCase(), item);
          }
        });
        return Array.from(map.values());
      };

      const languages = mergeCategory(
        currentStack.languages,
        detectedItems.filter((i) => i.category === 'languages')
      );
      const frameworks = mergeCategory(
        currentStack.frameworks,
        detectedItems.filter((i) => i.category === 'frameworks')
      );
      const databases = mergeCategory(
        currentStack.databases,
        detectedItems.filter((i) => i.category === 'databases')
      );
      const devops = mergeCategory(
        currentStack.devops,
        detectedItems.filter((i) => i.category === 'devops')
      );
      const libraries = mergeCategory(
        currentStack.libraries,
        detectedItems.filter((i) => i.category === 'libraries')
      );
      const tools = mergeCategory(
        currentStack.tools,
        detectedItems.filter((i) => i.category === 'tools')
      );

      updatedTechStack = {
        languages,
        frameworks,
        databases,
        devops,
        libraries,
        tools,
      };

      await this.boardRepo.updateTechStack(params.boardId, updatedTechStack);
    }

    return {
      extracted: detectedItems,
      updatedTechStack,
    };
  }
}
