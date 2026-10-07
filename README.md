# Trello AI — Kanban Inteligente com Clean Code & RAG

Aplicação web completa de gerenciamento visual de projetos baseada no modelo Kanban (estilo Trello), arquitetada rigorosamente segundo os princípios de **Clean Code** e **Clean Architecture**, com inteligência artificial open-source integrada para cadastro automático de tarefas, monitoramento preditivo de fluxo, dashboard analítico executivo e ingestão de arquivos `.md` com auto-detecção de tecnologias.

---

## 🚀 Funcionalidades Principais

1. **Quadro Kanban Visual (Padrão Trello+)**:
   - Quadros com múltiplas colunas dinâmicas (`Backlog`, `A Fazer`, `Em Progresso`, `Revisão / Testes`, `Concluído`).
   - Drag-and-drop de alta precisão entre listas e reordenação interna via `@dnd-kit`.
   - Limites de Trabalho em Progresso (**WIP Limits**) com alertas visuais contra sobrecarga.
   - Modal detalhado de cartão com suporte a **Markdown**, checklists interativos, prioridades (`Urgente`, `Alta`, `Média`, `Baixa`), prazos, estimativas de horas e Story Points.
   - Comemoração festiva interativa (efeito confetti) ao arrastar itens para a coluna "Concluído".

2. **Inteligência Artificial Integrada (Open Source & Local First)**:
   - **Prompt-to-Card**: Descreva uma tarefa ou funcionalidade em linguagem natural (ex: *"Criar rota de autenticação JWT com refresh token até sexta com prioridade alta"*). O motor de IA extrai automaticamente título, escopo em Markdown, estimativas de tempo/Story Points, etiquetas e checklists sugeridos.
   - **Auto-Detecção e Preenchimento de Tecnologias via `.md`**: Ao carregar ou sincronizar arquivos Markdown do projeto (como `README.md`, specs ou atas), a IA faz a leitura semântica imediata e popula as categorias técnicas do projeto (Linguagens, Frameworks, Banco de Dados, DevOps, Bibliotecas) e gera as tags correspondentes.
   - **Consultor Técnico do Projeto (Chat RAG)**: Converse com a IA em tempo real para tirar dúvidas sobre regras de negócio, especificações ou dependências técnicas com base nos documentos `.md` ingeridos.
   - **Monitor Preditivo de Gargalos**: Identificação automática de tarefas estagnadas, cartões sem critérios de aceitação, prazos em atraso ou colunas que ultrapassaram os limites WIP.

3. **Dashboard Executivo & Métricas**:
   - Taxa consolidada de conclusão (% de cartões e % de Story Points entregues).
   - Horas totais estimadas e carga de trabalho em andamento.
   - Gráfico em Rosca (Donut Chart) com a distribuição de atividades por tags/categorias técnicas via `Recharts`.
   - Gráfico de barras de fluxo e ocupação por coluna.
   - Painel de diagnósticos com severidades (`Alta`, `Média`, `Baixa`) e sugestões práticas de remediação.
   - Filtros dinâmicos por categoria, prioridade e status.

4. **Central de Documentação (.md)**:
   - Upload de arquivos Markdown direto do computador ou via editor interativo.
   - Renderização Markdown lado a lado com suporte a formatação rica, tabelas e tags detectadas.

---

## 🏛️ Arquitetura Clean Code

O projeto foi desacoplado em camadas independentes de frameworks:

```
src/
├── core/                                # NÚCLEO INDEPENDENTE DE FRAMEWORKS
│   ├── domain/
│   │   ├── entities/                    # Entidades puras (Board, Card, Column, TechStack, Metrics, Document)
│   │   └── repositories/                # Contratos de interfaces (IBoardRepository, IDocumentRepository, IAiService)
│   └── use-cases/                       # Casos de uso de negócio
│       ├── board/                       # GetBoardDetails, CreateCard, MoveCard, UpdateCard, DeleteCard
│       ├── ai/                          # GenerateCardFromPrompt, ExtractTechStackFromMd, QueryDocumentAssistant, AnalyzeBottlenecks
│       ├── analytics/                   # CalculateBoardMetrics
│       └── documents/                   # UploadProjectDoc, ListProjectDocs
│
├── infrastructure/                      # ADAPTADORES DE INFRAESTRUTURA
│   ├── database/                        # Implementação JsonFileStore (persistente local com zero dependências externas)
│   ├── ai/
│   │   ├── adapters/                    # RuleBasedNlpAdapter (offline determinístico) e OllamaAdapter (LLMs locais)
│   │   └── ai-service.facade.ts         # Facade resiliente que alterna entre Ollama e motor semântico nativo
│   └── container.ts                     # Composition Root (Injeção de Dependências)
│
├── components/                          # CAMADA DE APRESENTAÇÃO
│   ├── kanban/                          # BoardView, ColumnContainer, CardItem, CardModal, PromptToCardModal
│   ├── dashboard/                       # DashboardView, KpiCards, TagsDistributionChart, BottleneckAlerts
│   ├── docs/                            # DocHubView (Viewer .md, Upload e Chat RAG)
│   └── layout/                          # Sidebar e Header com badges de tecnologias
│
└── app/                                 # ROTAS E APIS NEXT.JS 14
    ├── page.tsx                         # Página principal do Kanban
    ├── dashboard/page.tsx               # Página de Métricas
    ├── docs/page.tsx                    # Central de Documentação .md
    └── api/                             # Endpoints RESTful para dados, métricas e IA
```

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18+ ou 20+
- npm instalado

### 2. Instalação e Execução
```bash
# Entrar no diretório
cd f:/Projetos_2026/Trello_AI

# Instalar dependências (caso ainda não tenha feito)
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse em seu navegador:
👉 **http://localhost:3000**

---

## 🤖 Integração com IA Open Source (Opcional - Ollama)

A aplicação conta com um motor semântico nativo de alta precisão que roda **100% offline e sem necessidade de configurações adicionais**.

Se você desejar utilizar um modelo LLM local (ex: Llama 3, Mistral, Qwen, DeepSeek):
1. Instale o [Ollama](https://ollama.com/).
2. Baixe o modelo desejado no terminal:
   ```bash
   ollama run llama3
   ```
3. Defina as variáveis no seu `.env.local`:
   ```env
   ENABLE_OLLAMA=true
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   ```
4. Reinicie a aplicação (`npm run dev`). A camada de infraestrutura detectará o serviço do Ollama automaticamente.
