import { IAiService, AiGeneratedCardResult, AiDocQueryResponse } from '../../core/domain/repositories/i-ai-service';
import { TechItem } from '../../core/domain/entities/tech-stack.entity';
import { ProjectDocument } from '../../core/domain/entities/document.entity';
import { BoardAggregate } from '../../core/domain/entities/board.entity';
import { BottleneckAlert } from '../../core/domain/entities/metrics.entity';
import { RuleBasedNlpAdapter } from './adapters/rule-based-nlp.adapter';

export class AiServiceFacade implements IAiService {
  private fallbackAdapter: RuleBasedNlpAdapter;
  private ollamaUrl?: string;
  private apiKey?: string;

  constructor() {
    this.fallbackAdapter = new RuleBasedNlpAdapter();
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  }

  async generateCardFromPrompt(
    prompt: string,
    context?: { boardName?: string; existingTags?: string[]; techStack?: string[] }
  ): Promise<AiGeneratedCardResult> {
    // Tenta usar Ollama se disponível
    if (process.env.ENABLE_OLLAMA === 'true') {
      try {
        const res = await fetch(`${this.ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: `Gere uma tarefa em JSON com { title, description, priority (low/medium/high/urgent), tags, estimatedHours, storyPoints, checklists: [{title, isCompleted}] } para: ${prompt}`,
            stream: false,
            format: 'json',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.response);
          return {
            ...parsed,
            rationale: 'Processado via modelo local Ollama.',
          };
        }
      } catch (e) {
        // Fallback silencioso
      }
    }

    // Processamento nativo de alto desempenho
    return this.fallbackAdapter.generateCardFromPrompt(prompt, context);
  }

  async extractTechStackFromMarkdown(
    markdownContent: string,
    fileName?: string
  ): Promise<TechItem[]> {
    return this.fallbackAdapter.extractTechStackFromMarkdown(markdownContent, fileName);
  }

  async queryDocumentAssistant(
    question: string,
    docs: ProjectDocument[],
    boardContext?: BoardAggregate
  ): Promise<AiDocQueryResponse> {
    return this.fallbackAdapter.queryDocumentAssistant(question, docs, boardContext);
  }

  async analyzeBoardHealth(board: BoardAggregate): Promise<BottleneckAlert[]> {
    return this.fallbackAdapter.analyzeBoardHealth(board);
  }
}
