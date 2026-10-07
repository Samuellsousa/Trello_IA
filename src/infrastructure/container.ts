import { JsonFileStore } from './database/json-store';
import { AiServiceFacade } from './ai/ai-service.facade';
import { GetBoardDetailsUseCase } from '../core/use-cases/board/get-board-details.use-case';
import { CreateCardUseCase } from '../core/use-cases/board/create-card.use-case';
import { MoveCardUseCase } from '../core/use-cases/board/move-card.use-case';
import { UpdateCardUseCase } from '../core/use-cases/board/update-card.use-case';
import { DeleteCardUseCase } from '../core/use-cases/board/delete-card.use-case';
import { GenerateCardFromPromptUseCase } from '../core/use-cases/ai/generate-card-from-prompt.use-case';
import { ExtractTechStackFromMdUseCase } from '../core/use-cases/ai/extract-tech-stack-from-md.use-case';
import { QueryDocumentAssistantUseCase } from '../core/use-cases/ai/query-document-assistant.use-case';
import { AnalyzeBoardBottlenecksUseCase } from '../core/use-cases/ai/analyze-board-bottlenecks.use-case';
import { CalculateBoardMetricsUseCase } from '../core/use-cases/analytics/calculate-board-metrics.use-case';
import { UploadProjectDocUseCase } from '../core/use-cases/documents/upload-project-doc.use-case';
import { ListProjectDocsUseCase } from '../core/use-cases/documents/list-project-docs.use-case';
import { CreateBoardUseCase } from '../core/use-cases/board/create-board.use-case';
import { ListBoardsSummaryUseCase } from '../core/use-cases/board/list-boards-summary.use-case';

// Instâncias Singleton de Infraestrutura
const store = new JsonFileStore();
const aiService = new AiServiceFacade();

// Instâncias dos Casos de Uso
export const createBoardUseCase = new CreateBoardUseCase(store);
export const listBoardsSummaryUseCase = new ListBoardsSummaryUseCase(store);
export const extractTechStackFromMdUseCase = new ExtractTechStackFromMdUseCase(aiService, store);
export const getBoardDetailsUseCase = new GetBoardDetailsUseCase(store);
export const createCardUseCase = new CreateCardUseCase(store);
export const moveCardUseCase = new MoveCardUseCase(store);
export const updateCardUseCase = new UpdateCardUseCase(store);
export const deleteCardUseCase = new DeleteCardUseCase(store);

export const generateCardFromPromptUseCase = new GenerateCardFromPromptUseCase(aiService, store);
export const queryDocumentAssistantUseCase = new QueryDocumentAssistantUseCase(aiService, store, store);
export const analyzeBoardBottlenecksUseCase = new AnalyzeBoardBottlenecksUseCase(aiService, store);
export const calculateBoardMetricsUseCase = new CalculateBoardMetricsUseCase();

export const uploadProjectDocUseCase = new UploadProjectDocUseCase(store, extractTechStackFromMdUseCase);
export const listProjectDocsUseCase = new ListProjectDocsUseCase(store);

export { store, aiService };
