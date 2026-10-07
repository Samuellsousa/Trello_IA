'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  FileCode2,
  Layers,
  ArrowRight,
  Boxes,
  TrendingUp,
  Tag,
  X,
  Loader2,
  Compass,
  FileText,
  Layout,
  Server,
  Database,
  Rocket,
  Cpu
} from 'lucide-react';
import { ProjectSummary } from '@/core/domain/entities/board.entity';
import { PREDEFINED_TASK_CATEGORIES, findCategoryMeta } from '@/core/domain/constants/task-categories';
import { ThemeToggle } from '../theme/theme-toggle';

interface ProjectHubViewProps {
  initialProjects: ProjectSummary[];
}

const DEFAULT_STACK_OPTIONS = [
  'Next.js 14',
  'React',
  'TypeScript',
  'Node.js',
  'Tailwind CSS',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Python',
  'FastAPI',
  'Prisma',
  'Redis'
];

const CATEGORY_ICON_MAP: Record<string, any> = {
  FileText,
  Layout,
  Server,
  Database,
  Rocket,
  Cpu,
  CheckCircle: CheckCircle2,
  Layers,
};

export function ProjectHubView({ initialProjects }: ProjectHubViewProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['TypeScript', 'Next.js 14', 'Tailwind CSS']);
  const [customTechInput, setCustomTechInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Totais agregados
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalCards = projects.reduce((acc, p) => acc + (p.totalCards || 0), 0);
    const completedCards = projects.reduce((acc, p) => acc + (p.completedCards || 0), 0);
    const totalHours = projects.reduce((acc, p) => acc + (p.totalEstimatedHours || 0), 0);
    const totalDocs = projects.reduce((acc, p) => acc + (p.docsCount || 0), 0);
    const avgCompletion =
      totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

    return { totalProjects, totalCards, completedCards, totalHours, totalDocs, avgCompletion };
  }, [projects]);

  // Filtro de projetos
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchCategory = p.categories?.some((c) => c.toLowerCase().includes(query));
      const matchTech = Object.values(p.techStack || {}).some((list) =>
        list?.some((item: any) => item.name.toLowerCase().includes(query))
      );
      return matchName || matchDesc || matchCategory || matchTech;
    });
  }, [projects, searchQuery]);

  const handleToggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((t) => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const handleAddCustomTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTechInput.trim()) {
      e.preventDefault();
      const trimmed = customTechInput.trim();
      if (!selectedTechs.includes(trimmed)) {
        setSelectedTechs([...selectedTechs, trimmed]);
      }
      setCustomTechInput('');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMessage('Por favor, informe o nome do projeto.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: projectName.trim(),
        description: projectDescription.trim() || 'Ambiente ágil e colaborativo com Kanban e IA.',
        techStackNames: selectedTechs,
      };

      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar projeto');
      }

      const createdBoard = await res.json();

      // Fechar modal e navegar diretamente para o novo quadro
      setIsCreateModalOpen(false);
      setProjectName('');
      setProjectDescription('');
      router.push(`/board/${createdBoard.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na comunicação com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#f8faf9] dark:bg-[#071712] transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="px-8 py-5 border-b border-[#dbe8e0] dark:border-[#14372b] bg-white/70 dark:bg-[#091f17]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-emerald-950 dark:text-emerald-50 tracking-tight flex items-center gap-2">
              Hub de Projetos
              <span className="text-xs bg-emerald-100 dark:bg-[#123025] text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800/60">
                {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie seus projetos, visualize o progresso e acesse o Kanban individual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Campo de Busca */}
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por projeto, tecnologia, categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0c231b] border border-[#d2e4d8] dark:border-[#153a2d] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <ThemeToggle />

          {/* Botão Novo Projeto */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI Strip Global */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0c231b] border border-[#dbe8e0] dark:border-[#14372b] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Total de Projetos</span>
              <Boxes className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {stats.totalProjects}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
              Workspaces ativos
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c231b] border border-[#dbe8e0] dark:border-[#14372b] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Tarefas Cadastradas</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {stats.totalCards}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {stats.completedCards} tarefas concluídas
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c231b] border border-[#dbe8e0] dark:border-[#14372b] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Conclusão Média</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {stats.avgCompletion}%
            </div>
            <div className="w-full bg-[#edf4f0] dark:bg-[#123025] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.avgCompletion}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c231b] border border-[#dbe8e0] dark:border-[#14372b] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Documentos .md</span>
              <FileCode2 className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {stats.totalDocs}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Bases de conhecimento RAG
            </p>
          </div>
        </section>

        {/* Listagem de Projetos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>Projetos Disponíveis</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Clique em um projeto para abrir o Kanban e as ferramentas
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#d2e4d8] dark:border-[#163a2d] bg-white/50 dark:bg-[#0c231b]/50 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-[#123025] text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Nenhum projeto encontrado
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {searchQuery
                    ? `Nenhum resultado corresponde à busca "${searchQuery}". Tente outros termos.`
                    : 'Cadastre seu primeiro projeto para começar a organizar atividades com Kanban e IA.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Novo Projeto</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const totalCards = project.totalCards || 0;
                const completedCards = project.completedCards || 0;
                const percentage = project.completionPercentage || 0;

                // Extrair lista de techs para exibir
                const techList: string[] = [];
                if (project.techStack) {
                  Object.values(project.techStack).forEach((arr) => {
                    arr?.forEach((item: any) => {
                      if (item.name && !techList.includes(item.name)) {
                        techList.push(item.name);
                      }
                    });
                  });
                }

                return (
                  <div
                    key={project.id}
                    className="group flex flex-col justify-between bg-white dark:bg-[#0c231b] border border-[#dbe8e0] dark:border-[#14372b] hover:border-emerald-400/80 dark:hover:border-emerald-600/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Top Header do Card */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-[#123025] text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-semibold text-xs border border-emerald-200 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
                            <FolderKanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                              {project.name}
                            </h3>
                            <span className="text-[10px] text-slate-400">
                              Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Badge de Conclusão */}
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            percentage === 100
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : percentage > 0
                              ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
                              : 'bg-slate-100 dark:bg-[#152e24] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1b3d30]'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>

                      {/* Descrição */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {project.description || 'Sem descrição cadastrada.'}
                      </p>

                      {/* Barra de Progresso Orgânica */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>Progresso Geral</span>
                          <span>
                            {completedCards} / {totalCards} concluídas
                          </span>
                        </div>
                        <div className="w-full bg-[#edf4f0] dark:bg-[#123025] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Categorias Ativas do Projeto */}
                      {project.categories && project.categories.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Categorias no Projeto
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {project.categories.slice(0, 4).map((catName, idx) => {
                              const meta = findCategoryMeta(catName);
                              if (meta) {
                                const IconComp = CATEGORY_ICON_MAP[meta.iconName] || Tag;
                                return (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${meta.bgColor} ${meta.color} ${meta.borderColor}`}
                                  >
                                    <IconComp className="w-2.5 h-2.5 opacity-80" />
                                    <span>{meta.name}</span>
                                  </span>
                                );
                              }
                              return (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-[#edf5f0] dark:bg-[#0e2a20] text-emerald-900/90 dark:text-emerald-300 border border-[#d2e4d8] dark:border-[#163c2f] px-2 py-0.5 rounded-md font-medium"
                                >
                                  #{catName}
                                </span>
                              );
                            })}
                            {project.categories.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{project.categories.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tech Stack */}
                      {techList.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Tecnologias
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {techList.slice(0, 4).map((tech, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 dark:bg-[#123025] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-[#163a2d]"
                              >
                                {tech}
                              </span>
                            ))}
                            {techList.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{techList.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer do Card com Métricas e Link */}
                    <div className="pt-3 border-t border-[#edf4f0] dark:border-[#14372b] flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {project.totalEstimatedHours ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {project.totalEstimatedHours}h
                          </span>
                        ) : null}

                        {project.docsCount ? (
                          <span className="flex items-center gap-1">
                            <FileCode2 className="w-3 h-3 text-slate-400" />
                            {project.docsCount} {project.docsCount === 1 ? 'doc' : 'docs'}
                          </span>
                        ) : null}
                      </div>

                      <Link
                        href={`/board/${project.id}`}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-[#123025] hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-emerald-800 dark:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl text-xs border border-emerald-200 dark:border-emerald-800/60 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
                      >
                        <span>Abrir Projeto</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Criação de Novo Projeto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c231b] border border-[#d5e7dd] dark:border-[#153a2d] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#dbe8e0] dark:border-[#153a2d] flex items-center justify-between bg-[#f8faf9] dark:bg-[#091f17]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-[#123025] text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Cadastrar Novo Projeto
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Inicializa um quadro Kanban com colunas padrão e suporte a IA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Nome do Projeto */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Plataforma E-commerce B2B, App Mobile, API de Pagamentos..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#153a2d] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Descrição do Projeto
                </label>
                <textarea
                  placeholder="Breve resumo dos objetivos, escopo e requisitos principais..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#153a2d] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                />
              </div>

              {/* Tecnologias Iniciais */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Tecnologias Iniciais (Tech Stack)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Selecione ou digite abaixo
                  </span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_STACK_OPTIONS.map((tech) => {
                    const isSelected = selectedTechs.includes(tech);
                    return (
                      <button
                        type="button"
                        key={tech}
                        onClick={() => handleToggleTech(tech)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-[#0e2a20] text-slate-600 dark:text-slate-300 border-[#d2e4d8] dark:border-[#153a2d] hover:border-emerald-300'
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>

                {/* Input para adicionar tecnologia extra */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar outra tecnologia e pressionar Enter..."
                    value={customTechInput}
                    onChange={(e) => setCustomTechInput(e.target.value)}
                    onKeyDown={handleAddCustomTech}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#153a2d] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTechInput.trim()) {
                        const t = customTechInput.trim();
                        if (!selectedTechs.includes(t)) setSelectedTechs([...selectedTechs, t]);
                        setCustomTechInput('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-emerald-50 dark:bg-[#123025] hover:bg-emerald-100 dark:hover:bg-[#184032] text-emerald-800 dark:text-emerald-300 font-medium rounded-lg border border-emerald-200 dark:border-emerald-800/60"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 border-t border-[#dbe8e0] dark:border-[#153a2d] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#123025] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Criando Projeto...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar e Abrir Quadro</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
