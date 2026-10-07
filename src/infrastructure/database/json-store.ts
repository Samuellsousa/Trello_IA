import fs from 'fs';
import path from 'path';
import { IBoardRepository } from '../../core/domain/repositories/i-board-repository';
import { IDocumentRepository } from '../../core/domain/repositories/i-document-repository';
import { Board, BoardAggregate, CreateBoardDTO, ProjectSummary } from '../../core/domain/entities/board.entity';
import { Column } from '../../core/domain/entities/column.entity';
import { Card, CreateCardDTO } from '../../core/domain/entities/card.entity';
import { ProjectDocument, CreateDocumentDTO } from '../../core/domain/entities/document.entity';
import { ProjectTechStack } from '../../core/domain/entities/tech-stack.entity';

interface DbSchema {
  boards: Board[];
  columns: Column[];
  cards: Card[];
  documents: ProjectDocument[];
}

export class JsonFileStore implements IBoardRepository, IDocumentRepository {
  private filePath: string;
  private data: DbSchema;

  constructor(customPath?: string) {
    const dataDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // Fallback
      }
    }
    this.filePath = customPath || path.join(dataDir, 'db.json');
    this.data = this.loadData();
    this.seedDefaultIfEmpty();
  }

  private ensureFreshData(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      // Mantém memória existente
    }
  }

  private loadData(): DbSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Erro ao carregar banco local, criando novo:', e);
    }
    return { boards: [], columns: [], cards: [], documents: [] };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erro ao salvar no banco local:', e);
    }
  }

  private seedDefaultIfEmpty(): void {
    if (this.data.boards.length > 0) return;

    const defaultBoardId = 'board-default';
    const now = new Date().toISOString();

    const defaultBoard: Board = {
      id: defaultBoardId,
      name: 'Trello AI — Desenvolvimento Central',
      description: 'Quadro principal para monitoramento e gestão das atividades com inteligência artificial.',
      colorTheme: 'from-blue-600 to-indigo-800',
      techStack: {
        languages: [{ id: '1', name: 'TypeScript', category: 'languages' }],
        frameworks: [
          { id: '2', name: 'Next.js 14', category: 'frameworks' },
          { id: '3', name: 'React', category: 'frameworks' },
          { id: '4', name: 'Tailwind CSS', category: 'frameworks' },
        ],
        databases: [{ id: '5', name: 'PostgreSQL / JSON Store', category: 'databases' }],
        devops: [{ id: '6', name: 'Docker', category: 'devops' }],
        libraries: [{ id: '7', name: '@dnd-kit', category: 'libraries' }, { id: '8', name: 'Lucide', category: 'libraries' }],
        tools: [{ id: '9', name: 'Git', category: 'tools' }],
      },
      createdAt: now,
      updatedAt: now,
    };

    const defaultColumns: Column[] = [
      { id: 'col-backlog', boardId: defaultBoardId, title: 'Backlog', order: 0 },
      { id: 'col-todo', boardId: defaultBoardId, title: 'A Fazer', order: 1 },
      { id: 'col-inprogress', boardId: defaultBoardId, title: 'Em Progresso', order: 2, wipLimit: 4 },
      { id: 'col-review', boardId: defaultBoardId, title: 'Revisão / Testes', order: 3 },
      { id: 'col-done', boardId: defaultBoardId, title: 'Concluído', order: 4 },
    ];

    const defaultCards: Card[] = [
      {
        id: 'card-1',
        boardId: defaultBoardId,
        columnId: 'col-inprogress',
        title: 'Implementar Drag-and-Drop visual com @dnd-kit',
        description: 'Adicionar suporte a movimentação fluida de cartões entre colunas com ordenação persistente.',
        priority: 'high',
        status: 'IN_PROGRESS',
        tags: ['Frontend', 'UI/UX', 'React'],
        estimatedHours: 6,
        storyPoints: 5,
        order: 0,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        checklists: [
          { id: 'c1', title: 'Configurar DndContext e SortableContext', isCompleted: true },
          { id: 'c2', title: 'Adicionar feedback visual no arraste', isCompleted: true },
          { id: 'c3', title: 'Persistir ordem na API', isCompleted: false },
        ],
        comments: [
          { id: 'cm1', author: 'IA Assistente', content: 'Coluna Em Progresso com 2 itens ativos.', createdAt: now },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'card-2',
        boardId: defaultBoardId,
        columnId: 'col-todo',
        title: 'Pipeline de extração de tecnologias via .md',
        description: 'Processar markdown ingerido e mapear categorias: Linguagens, Frameworks, Banco e DevOps.',
        priority: 'urgent',
        status: 'TODO',
        tags: ['AI', 'Backend', 'TypeScript'],
        estimatedHours: 8,
        storyPoints: 8,
        order: 0,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        checklists: [
          { id: 'c4', title: 'Criar parser semântico de keywords', isCompleted: true },
          { id: 'c5', title: 'Auto-popular badges do quadro', isCompleted: false },
        ],
        comments: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'card-3',
        boardId: defaultBoardId,
        columnId: 'col-done',
        title: 'Arquitetura Clean Code e Domínio de Entidades',
        description: 'Isolamento de UseCases, Entidades e Repositórios independentes de framework.',
        priority: 'medium',
        status: 'DONE',
        completedAt: now,
        tags: ['Arquitetura', 'Clean Code'],
        estimatedHours: 4,
        storyPoints: 3,
        order: 0,
        checklists: [
          { id: 'c6', title: 'Definir interfaces de domínio', isCompleted: true },
          { id: 'c7', title: 'Separar casos de uso em pacotes focados', isCompleted: true },
        ],
        comments: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'card-4',
        boardId: defaultBoardId,
        columnId: 'col-backlog',
        title: 'Dashboard Analítico com Recharts',
        description: 'Criar gráficos de rosca por tag, percentual de conclusão e alertas de gargalo.',
        priority: 'medium',
        status: 'BACKLOG',
        tags: ['Dashboard', 'Analytics', 'Frontend'],
        estimatedHours: 5,
        storyPoints: 5,
        order: 0,
        checklists: [],
        comments: [],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const defaultDocs: ProjectDocument[] = [
      {
        id: 'doc-1',
        boardId: defaultBoardId,
        title: 'Especificação do Trello AI',
        fileName: 'FUNCIONALIDADES.md',
        content: `# Trello AI — Kanban Inteligente\nStack: TypeScript, Next.js 14, Tailwind CSS, PostgreSQL, Docker, @dnd-kit.\nObjetivo: Gerenciamento ágil com IA e dashboard executivo.`,
        fileSize: 1024,
        extractedTechs: [
          { id: 't1', name: 'TypeScript', category: 'languages' },
          { id: 't2', name: 'Next.js 14', category: 'frameworks' },
          { id: 't3', name: 'Tailwind CSS', category: 'frameworks' },
          { id: 't4', name: 'PostgreSQL', category: 'databases' },
          { id: 't5', name: 'Docker', category: 'devops' },
          { id: 't6', name: '@dnd-kit', category: 'libraries' },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.data = {
      boards: [defaultBoard],
      columns: defaultColumns,
      cards: defaultCards,
      documents: defaultDocs,
    };
    this.saveData();
  }

  // --- IBoardRepository Implementation ---

  async listBoards(): Promise<Board[]> {
    this.ensureFreshData();
    return this.data.boards;
  }

  async listProjectsSummary(): Promise<ProjectSummary[]> {
    this.ensureFreshData();
    return this.data.boards.map((board) => {
      const boardCards = this.data.cards.filter((c) => c.boardId === board.id);
      const totalCards = boardCards.length;
      const completedCards = boardCards.filter((c) => c.status === 'DONE').length;
      const inProgressCards = boardCards.filter((c) => c.status === 'IN_PROGRESS').length;
      const todoCards = boardCards.filter((c) => c.status === 'TODO' || c.status === 'BACKLOG').length;
      const completionPercentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
      const totalEstimatedHours = boardCards.reduce((acc, c) => acc + (c.estimatedHours || 0), 0);
      const totalStoryPoints = boardCards.reduce((acc, c) => acc + (c.storyPoints || 0), 0);

      const categorySet = new Set<string>();
      boardCards.forEach((c) => {
        (c.tags || []).forEach((t) => categorySet.add(t));
      });
      const categories = Array.from(categorySet);

      const docsCount = this.data.documents.filter((d) => d.boardId === board.id).length;

      return {
        id: board.id,
        name: board.name,
        description: board.description,
        colorTheme: board.colorTheme,
        techStack: board.techStack,
        totalCards,
        completedCards,
        inProgressCards,
        todoCards,
        completionPercentage,
        totalEstimatedHours,
        totalStoryPoints,
        categories,
        docsCount,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      };
    });
  }

  async createBoard(dto: CreateBoardDTO): Promise<Board> {
    this.ensureFreshData();
    const now = new Date().toISOString();
    const boardId = `board-${Date.now()}`;

    const initialTechs = dto.initialTechs || [];
    const techStack: ProjectTechStack = {
      languages: [],
      frameworks: [],
      databases: [],
      devops: [],
      libraries: [],
      tools: [],
    };

    initialTechs.forEach((name, idx) => {
      const lower = name.toLowerCase();
      const item = { id: `tech-${Date.now()}-${idx}`, name, category: 'frameworks' as any };
      if (/typescript|javascript|python|java|c\+\+|c#|go|rust|ruby|php|kotlin|swift/i.test(lower)) {
        item.category = 'languages';
        techStack.languages.push(item);
      } else if (/postgres|mysql|sqlite|mongo|redis|mariadb|oracle|cassandra|dynamo/i.test(lower)) {
        item.category = 'databases';
        techStack.databases.push(item);
      } else if (/docker|kubernetes|k8s|aws|azure|gcp|vercel|ci\/cd|terraform|ansible/i.test(lower)) {
        item.category = 'devops';
        techStack.devops.push(item);
      } else if (/git|github|gitlab|figma|jira|postman|vscode/i.test(lower)) {
        item.category = 'tools';
        techStack.tools.push(item);
      } else {
        item.category = 'frameworks';
        techStack.frameworks.push(item);
      }
    });

    const newBoard: Board = {
      id: boardId,
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      colorTheme: dto.colorTheme || 'from-emerald-600 to-teal-800',
      techStack,
      createdAt: now,
      updatedAt: now,
    };

    this.data.boards.push(newBoard);

    // Inicializar 5 colunas padrão para o novo projeto
    const defaultCols: Column[] = [
      { id: `col-${Date.now()}-backlog`, boardId, title: 'Backlog', order: 0 },
      { id: `col-${Date.now()}-todo`, boardId, title: 'A Fazer', order: 1 },
      { id: `col-${Date.now()}-inprogress`, boardId, title: 'Em Progresso', order: 2, wipLimit: 4 },
      { id: `col-${Date.now()}-review`, boardId, title: 'Revisão / Testes', order: 3 },
      { id: `col-${Date.now()}-done`, boardId, title: 'Concluído', order: 4 },
    ];
    this.data.columns.push(...defaultCols);

    this.saveData();
    return newBoard;
  }

  async getBoardAggregate(boardId: string): Promise<BoardAggregate | null> {
    this.ensureFreshData();
    const board = this.data.boards.find((b) => b.id === boardId);
    if (!board) return null;

    const columns = this.data.columns
      .filter((col) => col.boardId === boardId)
      .sort((a, b) => a.order - b.order)
      .map((col) => {
        const cards = this.data.cards
          .filter((card) => card.columnId === col.id)
          .sort((a, b) => a.order - b.order);
        return { ...col, cards };
      });

    return { ...board, columns };
  }

  async createCard(dto: CreateCardDTO): Promise<Card> {
    this.ensureFreshData();
    const now = new Date().toISOString();
    const existingInCol = this.data.cards.filter((c) => c.columnId === dto.columnId);
    const newOrder = existingInCol.length;

    const targetColumn = this.data.columns.find((c) => c.id === dto.columnId);
    let initialStatus = dto.status || 'TODO';
    if (!dto.status && targetColumn) {
      const colTitle = targetColumn.title.toLowerCase();
      if (/conclu[ií]d|done|finished/i.test(colTitle)) initialStatus = 'DONE';
      else if (/revis|review|test/i.test(colTitle)) initialStatus = 'IN_REVIEW';
      else if (/progress|fazendo|doing/i.test(colTitle)) initialStatus = 'IN_PROGRESS';
      else if (/backlog/i.test(colTitle)) initialStatus = 'BACKLOG';
    }

    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      boardId: dto.boardId,
      columnId: dto.columnId,
      title: dto.title,
      description: dto.description || '',
      priority: dto.priority || 'medium',
      status: initialStatus as any,
      completedAt: initialStatus === 'DONE' ? now : undefined,
      tags: dto.tags || [],
      dueDate: dto.dueDate,
      estimatedHours: dto.estimatedHours || 0,
      storyPoints: dto.storyPoints || 0,
      order: newOrder,
      checklists: (dto.checklists || []).map((ch, idx) => ({
        id: `check-${Date.now()}-${idx}`,
        title: ch.title,
        isCompleted: Boolean(ch.isCompleted),
      })),
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    this.data.cards.push(newCard);
    this.saveData();
    return newCard;
  }

  async updateCard(cardId: string, partial: Partial<Card>): Promise<Card> {
    this.ensureFreshData();
    const index = this.data.cards.findIndex((c) => c.id === cardId);
    if (index === -1) throw new Error('Cartão não encontrado.');

    const updated = {
      ...this.data.cards[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.data.cards[index] = updated;
    this.saveData();
    return updated;
  }

  async deleteCard(cardId: string): Promise<boolean> {
    this.ensureFreshData();
    const initialLen = this.data.cards.length;
    this.data.cards = this.data.cards.filter((c) => c.id !== cardId);
    const deleted = this.data.cards.length < initialLen;
    if (deleted) this.saveData();
    return deleted;
  }

  async moveCard(cardId: string, targetColumnId: string, newOrder: number): Promise<Card> {
    this.ensureFreshData();
    const card = this.data.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Cartão não encontrado.');

    const oldColumnId = card.columnId;
    card.columnId = targetColumnId;
    card.order = newOrder;
    card.updatedAt = new Date().toISOString();

    // Atualizar status e timestamps automaticamente de acordo com a coluna de destino
    const targetColumn = this.data.columns.find((c) => c.id === targetColumnId);
    if (targetColumn) {
      const colTitle = targetColumn.title.toLowerCase();
      if (/conclu[ií]d|done|finished/i.test(colTitle)) {
        card.status = 'DONE';
        card.completedAt = new Date().toISOString();
        // Marca checklists como concluidos automaticamente ao finalizar
        card.checklists = card.checklists.map((ch) => ({ ...ch, isCompleted: true }));
      } else if (/revis|review|test/i.test(colTitle)) {
        card.status = 'IN_REVIEW';
        card.completedAt = undefined;
      } else if (/progress|fazendo|doing/i.test(colTitle)) {
        card.status = 'IN_PROGRESS';
        card.completedAt = undefined;
      } else if (/backlog/i.test(colTitle)) {
        card.status = 'BACKLOG';
        card.completedAt = undefined;
      } else {
        card.status = 'TODO';
        card.completedAt = undefined;
      }
    }

    // Reordenar os demais cartões na coluna de destino
    const targetCards = this.data.cards
      .filter((c) => c.columnId === targetColumnId && c.id !== cardId)
      .sort((a, b) => a.order - b.order);

    targetCards.splice(newOrder, 0, card);
    targetCards.forEach((c, idx) => {
      c.order = idx;
    });

    // Reajustar ordens na coluna antiga se mudou de coluna
    if (oldColumnId !== targetColumnId) {
      const oldCards = this.data.cards
        .filter((c) => c.columnId === oldColumnId)
        .sort((a, b) => a.order - b.order);
      oldCards.forEach((c, idx) => {
        c.order = idx;
      });
    }

    this.saveData();
    return card;
  }

  async createColumn(boardId: string, title: string): Promise<Column> {
    const boardCols = this.data.columns.filter((c) => c.boardId === boardId);
    const newCol: Column = {
      id: `col-${Date.now()}`,
      boardId,
      title,
      order: boardCols.length,
    };
    this.data.columns.push(newCol);
    this.saveData();
    return newCol;
  }

  async updateTechStack(boardId: string, techStack: ProjectTechStack): Promise<Board> {
    const board = this.data.boards.find((b) => b.id === boardId);
    if (!board) throw new Error('Board não encontrado.');
    board.techStack = techStack;
    board.updatedAt = new Date().toISOString();
    this.saveData();
    return board;
  }

  // --- IDocumentRepository Implementation ---

  async listDocuments(boardId: string): Promise<ProjectDocument[]> {
    return this.data.documents.filter((d) => d.boardId === boardId);
  }

  async getDocumentById(id: string): Promise<ProjectDocument | null> {
    return this.data.documents.find((d) => d.id === id) || null;
  }

  async createDocument(dto: CreateDocumentDTO): Promise<ProjectDocument> {
    const now = new Date().toISOString();
    const doc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      boardId: dto.boardId,
      title: dto.title,
      fileName: dto.fileName,
      content: dto.content,
      fileSize: Buffer.byteLength(dto.content, 'utf-8'),
      extractedTechs: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.documents.push(doc);
    this.saveData();
    return doc;
  }

  async updateDocument(id: string, partial: Partial<ProjectDocument>): Promise<ProjectDocument> {
    const idx = this.data.documents.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Documento não encontrado.');
    const updated = {
      ...this.data.documents[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.data.documents[idx] = updated;
    this.saveData();
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const initialLen = this.data.documents.length;
    this.data.documents = this.data.documents.filter((d) => d.id !== id);
    const deleted = this.data.documents.length < initialLen;
    if (deleted) this.saveData();
    return deleted;
  }
}
