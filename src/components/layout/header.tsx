'use client';

import React from 'react';
import { Sparkles, Plus, Code2, Search } from 'lucide-react';
import { ProjectTechStack } from '@/core/domain/entities/tech-stack.entity';
import { ThemeToggle } from '../theme/theme-toggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  techStack?: ProjectTechStack;
  onOpenAiPromptModal?: () => void;
  onOpenNewCardModal?: () => void;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export function Header({
  title,
  subtitle,
  techStack,
  onOpenAiPromptModal,
  onOpenNewCardModal,
  onSearchChange,
  searchValue = '',
}: HeaderProps) {
  const allTechs = [
    ...(techStack?.frameworks || []),
    ...(techStack?.languages || []),
    ...(techStack?.databases || []),
    ...(techStack?.devops || []),
  ].slice(0, 5);

  return (
    <header className="border-b border-[#dce9e1] dark:border-[#14372b] bg-[#f8faf9]/90 dark:bg-[#071712]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Tech Badges */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 tracking-tight">{title}</h1>
            {techStack && allTechs.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 ml-2">
                {allTechs.map((tech) => (
                  <span
                    key={tech.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#eaf4ee] dark:bg-[#0e2c20] text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60"
                  >
                    <Code2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    {tech.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60 mt-0.5">{subtitle}</p>}
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-3">
          {onSearchChange && (
            <div className="relative w-48 sm:w-64">
              <Search className="w-4 h-4 text-emerald-700/50 dark:text-emerald-400/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar tarefas..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#edf5f0] dark:bg-[#0d271e] border border-[#d2e4d8] dark:border-[#184232] rounded-lg pl-9 pr-3 py-1.5 text-xs text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-800/40 dark:placeholder:text-emerald-400/40 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
              />
            </div>
          )}

          {/* AI Prompt Button */}
          {onOpenAiPromptModal && (
            <button
              onClick={onOpenAiPromptModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Criar com IA</span>
            </button>
          )}

          {/* Manual Card Button */}
          {onOpenNewCardModal && (
            <button
              onClick={onOpenNewCardModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-emerald-50/50 dark:bg-[#0d271e] dark:hover:bg-[#12362a] text-emerald-900 dark:text-emerald-200 border border-[#d2e4d8] dark:border-[#184232] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Tarefa</span>
            </button>
          )}

          {/* Theme Toggle in Header */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
