import { IDocumentRepository } from '../../domain/repositories/i-document-repository';
import { CreateDocumentDTO, ProjectDocument } from '../../domain/entities/document.entity';
import { ExtractTechStackFromMdUseCase } from '../ai/extract-tech-stack-from-md.use-case';

export class UploadProjectDocUseCase {
  constructor(
    private docRepo: IDocumentRepository,
    private extractTechUseCase?: ExtractTechStackFromMdUseCase
  ) {}

  async execute(dto: CreateDocumentDTO, autoExtractStack: boolean = true): Promise<ProjectDocument> {
    const doc = await this.docRepo.createDocument(dto);

    if (autoExtractStack && this.extractTechUseCase) {
      try {
        const { extracted } = await this.extractTechUseCase.execute({
          markdownContent: dto.content,
          boardId: dto.boardId,
          fileName: dto.fileName,
          applyToBoard: true,
        });

        if (extracted.length > 0) {
          return await this.docRepo.updateDocument(doc.id, {
            extractedTechs: extracted,
          });
        }
      } catch (err) {
        console.error('Falha ao auto-extrair tecnologias do .md:', err);
      }
    }

    return doc;
  }
}
