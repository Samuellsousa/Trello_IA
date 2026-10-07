'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Loader2, 
  Check, 
  ListTodo,
  CheckCircle2
} from 'lucide-react';
import { Column } from '@/core/domain/entities/column.entity';
import { CategorySelector } from './category-selector';

interface PromptToCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onCardCreated: () => void;
}

export function PromptToCardModal({
  isOpen,
  onClose,
  columns,
  onCardCreated,
}: PromptToCardModalProps) {
  const [prompt, setPrompt] = useState('');
  const [targetColumnId, setTargetColumnId] = useState(columns[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/prompt-to-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          boardId: 'board-default',
          targetColumnId: targetColumnId || columns[0]?.id,
          autoCreate: false,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao processar solicitação com IA');
      }

      const data = await res.json();
      setPreview(data.preview);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: 'board-default',
          columnId: targetColumnId || columns[0]?.id,
          title: preview.title,
          description: preview.description,
          priority: preview.priority,
          tags: preview.tags,
          estimatedHours: preview.estimatedHours,
          storyPoints: preview.storyPoints,
          checklists: preview.checklists,
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar tarefa');
      onCardCreated();
      onClose();
      setPrompt('');
      setPreview(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-[#d2e4d8] dark:border-[#163a2d] flex items-center justify-between bg-[#edf5f0] dark:bg-[#081a13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-600/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-50 tracking-tight">
                Criar Tarefa com Inteligência Artificial
              </h2>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60">
                Descreva em linguagem natural e a IA estrutura título, checklists e estimativas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-[#dfeee5] dark:hover:bg-[#123326] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-2">
              Descreva a atividade ou funcionalidade
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Implementar pipeline de CI/CD no GitHub Actions com build do Docker e testes automatizados até quinta, prioridade alta..."
              className="w-full bg-[#f8faf9] dark:bg-[#071712] border border-[#d2e4d8] dark:border-[#163a2d] rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-400/40 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-emerald-400/60">Exemplos rápidos:</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('Criar autenticação JWT com refresh token e middleware de proteção')}
                className="text-[11px] bg-[#edf5f0] dark:bg-[#0e2a20] hover:bg-[#e2efe6] dark:hover:bg-[#13362a] text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded border border-[#d2e4d8] dark:border-[#184232] transition-colors"
              >
                🔐 Autenticação JWT
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('Otimizar queries do PostgreSQL e adicionar índices de busca vetorial')}
                className="text-[11px] bg-[#edf5f0] dark:bg-[#0e2a20] hover:bg-[#e2efe6] dark:hover:bg-[#13362a] text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded border border-[#d2e4d8] dark:border-[#184232] transition-colors"
              >
                ⚡ Otimizar Banco & Índices
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('Criar componente de Dashboard com gráficos de conclusão em Recharts')}
                className="text-[11px] bg-[#edf5f0] dark:bg-[#0e2a20] hover:bg-[#e2efe6] dark:hover:bg-[#13362a] text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded border border-[#d2e4d8] dark:border-[#184232] transition-colors"
              >
                📊 Gráficos de Métricas
              </button>
            </div>
          </div>

          {/* Coluna de Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                Coluna de Destino
              </label>
              <select
                value={targetColumnId}
                onChange={(e) => setTargetColumnId(e.target.value)}
                className="w-full bg-[#f8faf9] dark:bg-[#071712] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {loading && !preview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Gerar Estrutura com IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* IA Preview Result */}
          {preview && (
            <div className="mt-4 p-4 rounded-xl bg-[#f8faf9] dark:bg-[#081a13] border border-emerald-500/30 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Sugestão Estruturada pela IA
                </span>
                <span className="text-xs bg-white dark:bg-[#0c221a] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-[#d2e4d8] dark:border-[#163a2d] font-medium">
                  {preview.storyPoints} Story Points ({preview.estimatedHours}h)
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{preview.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{preview.description}</p>
              </div>

              {/* Category Selector */}
              <div className="pt-2 border-t border-[#d2e4d8] dark:border-[#163a2d]">
                <CategorySelector
                  selectedCategories={preview.tags || []}
                  onChange={(newTags) => setPreview({ ...preview, tags: newTags })}
                  label="Categorias da Tarefa (Selecione 1 ou Várias)"
                  helperText="Ajuste as categorias sugeridas pela IA ou adicione novas."
                />
              </div>

              {/* Checklists Preview */}
              {preview.checklists?.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-[#d2e4d8] dark:border-[#163a2d]">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <ListTodo className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Critérios de Aceitação & Checklists ({preview.checklists.length}):
                  </span>
                  <ul className="space-y-1 pl-1">
                    {preview.checklists.map((ch: any, i: number) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {ch.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d2e4d8] dark:border-[#163a2d] flex items-center justify-end gap-3 bg-[#edf5f0] dark:bg-[#081a13]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-[#0c221a] transition-colors"
          >
            Cancelar
          </button>

          {preview && (
            <button
              onClick={handleConfirmCreate}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Adicionar Tarefa ao Quadro</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
