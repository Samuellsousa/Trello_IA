import { IAiService, AiGeneratedCardResult, AiDocQueryResponse } from '../../../core/domain/repositories/i-ai-service';
import { TechItem, TechCategory } from '../../../core/domain/entities/tech-stack.entity';
import { ProjectDocument } from '../../../core/domain/entities/document.entity';
import { BoardAggregate } from '../../../core/domain/entities/board.entity';
import { BottleneckAlert } from '../../../core/domain/entities/metrics.entity';

const TECH_CATALOG: { name: string; category: TechCategory; aliases: string[] }[] = [
  // Linguagens
  { name: 'TypeScript', category: 'languages', aliases: ['typescript', 'ts'] },
  { name: 'JavaScript', category: 'languages', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { name: 'Python', category: 'languages', aliases: ['python', 'py', 'python3'] },
  { name: 'Go', category: 'languages', aliases: ['golang', 'go lang'] },
  { name: 'Rust', category: 'languages', aliases: ['rust', 'cargo'] },
  { name: 'Java', category: 'languages', aliases: ['java', 'jvm', 'openjdk'] },
  { name: 'C#', category: 'languages', aliases: ['c#', 'csharp', '.net', 'dotnet'] },
  { name: 'C++', category: 'languages', aliases: ['c++', 'cpp'] },
  { name: 'PHP', category: 'languages', aliases: ['php', 'laravel'] },
  { name: 'Ruby', category: 'languages', aliases: ['ruby', 'rails'] },
  { name: 'SQL', category: 'languages', aliases: ['sql', 't-sql', 'pl/sql'] },

  // Frameworks
  { name: 'Next.js', category: 'frameworks', aliases: ['next.js', 'nextjs', 'next 14', 'next 15'] },
  { name: 'React', category: 'frameworks', aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Vue.js', category: 'frameworks', aliases: ['vue', 'vue.js', 'vuejs', 'nuxt'] },
  { name: 'Angular', category: 'frameworks', aliases: ['angular', 'angularjs'] },
  { name: 'Svelte', category: 'frameworks', aliases: ['svelte', 'sveltekit'] },
  { name: 'Tailwind CSS', category: 'frameworks', aliases: ['tailwind', 'tailwindcss'] },
  { name: 'FastAPI', category: 'frameworks', aliases: ['fastapi', 'fast-api'] },
  { name: 'NestJS', category: 'frameworks', aliases: ['nestjs', 'nest.js'] },
  { name: 'Express', category: 'frameworks', aliases: ['express', 'express.js', 'expressjs'] },
  { name: 'Django', category: 'frameworks', aliases: ['django'] },
  { name: 'Spring Boot', category: 'frameworks', aliases: ['spring boot', 'spring-boot', 'spring'] },

  // Bancos de Dados
  { name: 'PostgreSQL', category: 'databases', aliases: ['postgresql', 'postgres', 'psql'] },
  { name: 'MySQL', category: 'databases', aliases: ['mysql', 'mariadb'] },
  { name: 'MongoDB', category: 'databases', aliases: ['mongodb', 'mongo'] },
  { name: 'Redis', category: 'databases', aliases: ['redis', 'redis-cache'] },
  { name: 'SQLite', category: 'databases', aliases: ['sqlite', 'sqlite3'] },
  { name: 'pgvector', category: 'databases', aliases: ['pgvector', 'vector db'] },
  { name: 'ChromaDB', category: 'databases', aliases: ['chromadb', 'chroma'] },
  { name: 'Qdrant', category: 'databases', aliases: ['qdrant'] },
  { name: 'Pinecone', category: 'databases', aliases: ['pinecone'] },

  // DevOps & Cloud
  { name: 'Docker', category: 'devops', aliases: ['docker', 'dockerfile', 'docker-compose'] },
  { name: 'Kubernetes', category: 'devops', aliases: ['kubernetes', 'k8s'] },
  { name: 'GitHub Actions', category: 'devops', aliases: ['github actions', 'gh actions', 'ci/cd'] },
  { name: 'AWS', category: 'devops', aliases: ['aws', 'amazon web services', 's3', 'ec2'] },
  { name: 'Vercel', category: 'devops', aliases: ['vercel'] },
  { name: 'Linux', category: 'devops', aliases: ['linux', 'ubuntu', 'debian'] },
  { name: 'Nginx', category: 'devops', aliases: ['nginx'] },

  // Bibliotecas & Ferramentas
  { name: '@dnd-kit', category: 'libraries', aliases: ['@dnd-kit', 'dnd-kit', 'drag and drop'] },
  { name: 'Lucide', category: 'libraries', aliases: ['lucide', 'lucide-react'] },
  { name: 'Prisma', category: 'libraries', aliases: ['prisma', 'prisma orm'] },
  { name: 'Drizzle ORM', category: 'libraries', aliases: ['drizzle', 'drizzle-orm'] },
  { name: 'LangChain', category: 'libraries', aliases: ['langchain', 'langchainjs'] },
  { name: 'LlamaIndex', category: 'libraries', aliases: ['llamaindex'] },
  { name: 'Zustand', category: 'libraries', aliases: ['zustand'] },
  { name: 'Recharts', category: 'libraries', aliases: ['recharts', 'chart.js'] },
  { name: 'Git', category: 'tools', aliases: ['git', 'github', 'gitlab'] },
  { name: 'Ollama', category: 'tools', aliases: ['ollama'] },
];

export class RuleBasedNlpAdapter implements IAiService {
  async generateCardFromPrompt(
    prompt: string,
    context?: { boardName?: string; existingTags?: string[]; techStack?: string[] }
  ): Promise<AiGeneratedCardResult> {
    const clean = prompt.trim();

    // 1. Prioridade
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (/urgente|critico|crítico|imediat|bloqueante/i.test(clean)) {
      priority = 'urgent';
    } else if (/alta|importante|priorit[aá]ri/i.test(clean)) {
      priority = 'high';
    } else if (/baixa|depois|opcional/i.test(clean)) {
      priority = 'low';
    }

    // 2. Horas estimadas
    let estimatedHours = 4;
    const hoursMatch = clean.match(/(\d+)\s*(h|horas|hrs)/i);
    if (hoursMatch) {
      estimatedHours = parseInt(hoursMatch[1], 10);
    }

    // 3. Story points proporcional às horas
    const storyPoints = Math.max(1, Math.round(estimatedHours * 0.8));

    // 4. Extração de tags correspondentes
    const tags: string[] = [];
    if (/bug|erro|falha|corre[cç][aã]o/i.test(clean)) tags.push('Bug');
    if (/feature|funcionalidade|criar|implementar|adicionar/i.test(clean)) tags.push('Feature');
    if (/front|tela|ui|css|layout|design/i.test(clean)) tags.push('Frontend');
    if (/back|api|endpoint|servidor|banco/i.test(clean)) tags.push('Backend');
    if (/ia|ai|prompt|rag|llm|modelo/i.test(clean)) tags.push('AI');
    if (/doc|documenta[cç][aã]o|readme/i.test(clean)) tags.push('Documentação');

    // Casar com a stack do projeto se aplicável
    if (context?.techStack) {
      context.techStack.forEach((t) => {
        if (new RegExp(`\\b${t}\\b`, 'i').test(clean) && !tags.includes(t)) {
          tags.push(t);
        }
      });
    }

    if (tags.length === 0) tags.push('Geral');

    // 5. Checklists gerados contextualmente
    const checklists: { title: string; isCompleted: boolean }[] = [];
    if (/autentica|login|oauth|token/i.test(clean)) {
      checklists.push({ title: 'Configurar middleware de sessão/tokens', isCompleted: false });
      checklists.push({ title: 'Implementar validação e formulário de login', isCompleted: false });
      checklists.push({ title: 'Criar testes de autenticação', isCompleted: false });
    } else if (/banco|migration|tabela|schema/i.test(clean)) {
      checklists.push({ title: 'Definir schema e relacionamentos', isCompleted: false });
      checklists.push({ title: 'Executar e validar migration', isCompleted: false });
      checklists.push({ title: 'Criar repositório com queries tipadas', isCompleted: false });
    } else if (/componente|tela|ui|layout/i.test(clean)) {
      checklists.push({ title: 'Desenvolver layout responsivo com Tailwind', isCompleted: false });
      checklists.push({ title: 'Vincular estados e interatividade', isCompleted: false });
      checklists.push({ title: 'Validar estados de loading e erro', isCompleted: false });
    } else {
      checklists.push({ title: 'Planejamento e especificação dos requisitos', isCompleted: true });
      checklists.push({ title: 'Implementação da funcionalidade principal', isCompleted: false });
      checklists.push({ title: 'Validação e revisão final', isCompleted: false });
    }

    // 6. Título limpo
    let title = clean.split('\n')[0].replace(/^(criar|fazer|implementar|tarefa:?)\s*/i, '');
    if (title.length > 70) {
      title = title.substring(0, 67) + '...';
    }
    // Capitalizar primeira letra
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      title,
      description: `**Objetivo:** ${clean}\n\n*Gerado automaticamente pelo motor inteligente de tarefas.*`,
      priority,
      tags,
      estimatedHours,
      storyPoints,
      checklists,
      rationale: `Análise estruturada: prioridade ${priority}, esforço estimado de ${estimatedHours}h (${storyPoints} SP), com ${checklists.length} subtarefas sugeridas.`,
    };
  }

  async extractTechStackFromMarkdown(
    markdownContent: string,
    fileName?: string
  ): Promise<TechItem[]> {
    const contentLower = markdownContent.toLowerCase();
    const detected: TechItem[] = [];

    TECH_CATALOG.forEach((item) => {
      const match = item.aliases.some((alias) => {
        const regex = new RegExp(`\\b${alias.replace('.', '\\.')}\\b`, 'i');
        return regex.test(contentLower);
      });

      if (match) {
        detected.push({
          id: `tech-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: item.name,
          category: item.category,
          confidence: 0.95,
        });
      }
    });

    return detected;
  }

  async queryDocumentAssistant(
    question: string,
    docs: ProjectDocument[],
    boardContext?: BoardAggregate
  ): Promise<AiDocQueryResponse> {
    const qLower = question.toLowerCase();
    const citedSections: string[] = [];

    // Busca contextual nos docs
    const matchingDocs = docs.filter((doc) => {
      const docLower = doc.content.toLowerCase();
      const tokens = qLower.split(/\s+/).filter((t) => t.length > 3);
      const score = tokens.reduce((acc, t) => (docLower.includes(t) ? acc + 1 : acc), 0);
      return score > 0;
    });

    let answer = '';

    if (matchingDocs.length > 0) {
      const firstDoc = matchingDocs[0];
      citedSections.push(`${firstDoc.fileName} (${firstDoc.title})`);

      // Encontrar trechos relevantes
      const lines = firstDoc.content.split('\n');
      const relevantLines = lines.filter((line) => {
        const lineLower = line.toLowerCase();
        return qLower.split(/\s+/).some((t) => t.length > 3 && lineLower.includes(t));
      }).slice(0, 5);

      answer = `Com base no documento **${firstDoc.fileName}**:\n\n` +
        (relevantLines.length > 0
          ? relevantLines.map((l) => `> ${l.trim()}`).join('\n>\n')
          : `O documento aborda as diretrizes do projeto relacionadas a "${question}".`) +
        `\n\n**Resumo Estruturado:** A especificação técnica define alinhamento direto com o quadro Kanban do projeto.`;
    } else {
      answer = `Analisei os ${docs.length} documentos carregados no projeto. Não foi localizada uma seção com menção direta exata a "${question}". Verifique se o termo consta no arquivo ou adicione uma especificação em .md para que a IA possa indexar.`;
    }

    if (boardContext) {
      const totalCards = boardContext.columns.flatMap((c) => c.cards).length;
      answer += `\n\n*Status atual do quadro:* **${boardContext.name}** possui ${boardContext.columns.length} colunas e ${totalCards} tarefas ativas.`;
    }

    return {
      answer,
      citedSections,
    };
  }

  async analyzeBoardHealth(board: BoardAggregate): Promise<BottleneckAlert[]> {
    const alerts: BottleneckAlert[] = [];
    const allCards = board.columns.flatMap((c) => c.cards);

    // 1. Cartões parados ou sem descrição detalhada
    allCards.forEach((c) => {
      if (!c.description || c.description.trim().length < 15) {
        alerts.push({
          id: `desc-${c.id}`,
          cardId: c.id,
          cardTitle: c.title,
          severity: 'low',
          message: `Tarefa sem descrição detalhada ou critérios de aceitação.`,
          suggestion: 'Utilize o assistente de IA para enriquecer o escopo e checklists.',
        });
      }
    });

    // 2. Concentração excessiva em uma coluna
    board.columns.forEach((col) => {
      if (col.cards.length > 5 && !/conclu[ií]d/i.test(col.title)) {
        alerts.push({
          id: `load-${col.id}`,
          columnId: col.id,
          columnTitle: col.title,
          severity: 'medium',
          message: `Coluna "${col.title}" acumula ${col.cards.length} tarefas. Potencial retenção de fluxo.`,
          suggestion: 'Considere dividir as atividades ou rebalancear prioridades entre a equipe.',
        });
      }
    });

    return alerts;
  }
}
