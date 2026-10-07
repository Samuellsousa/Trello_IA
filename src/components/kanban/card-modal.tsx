'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag, 
  CheckSquare, 
  Plus, 
  AlignLeft,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, PriorityLevel } from '@/core/domain/entities/card.entity';
import { CategorySelector } from './category-selector';

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated: () => void;
  onCardDeleted: () => void;
}

export function CardModal({
  card,
  isOpen,
  onClose,
  onCardUpdated,
  onCardDeleted,
}: CardModalProps) {
  if (!isOpen || !card) return null;

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState<PriorityLevel>(card.priority);
  const [status, setStatus] = useState<any>(card.status || 'TODO');
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');
  const [estimatedHours, setEstimatedHours] = useState(card.estimatedHours || 0);
  const [storyPoints, setStoryPoints] = useState(card.storyPoints || 0);
  const [tags, setTags] = useState<string[]>(card.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [checklists, setChecklists] = useState(card.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [isPreviewDesc, setIsPreviewDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          completedAt: status === 'DONE' ? (card.completedAt || new Date().toISOString()) : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          estimatedHours: Number(estimatedHours),
          storyPoints: Number(storyPoints),
          tags,
          checklists,
        }),
      });
      onCardUpdated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir este cartão?')) return;
    try {
      await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
      onCardDeleted();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const addChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    setChecklists((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, title: newChecklistTitle.trim(), isCompleted: false },
    ]);
    setNewChecklistTitle('');
  };

  const removeChecklist = (id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  const addTag = () => {
    if (!newTagInput.trim() || tags.includes(newTagInput.trim())) return;
    setTags([...tags, newTagInput.trim()]);
    setNewTagInput('');
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-[#d2e4d8] dark:border-[#163a2d] flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-emerald-950 dark:text-emerald-50 border-b border-transparent hover:border-[#d2e4d8] dark:hover:border-[#184232] focus:border-emerald-600 focus:outline-none px-1 py-0.5 rounded transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              title="Excluir cartão"
              className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-[#edf5f0] dark:hover:bg-[#123326] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-lg hover:bg-[#edf5f0] dark:hover:bg-[#123326] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Properties row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#edf5f0] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] text-xs">
            {/* Status */}
            <div>
              <span className="text-emerald-900/70 dark:text-emerald-300/70 font-medium block mb-1">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">A Fazer</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="IN_REVIEW">Revisão</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <span className="text-emerald-900/70 dark:text-emerald-300/70 font-medium block mb-1">Prioridade</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Due date */}
            <div>
              <span className="text-emerald-900/70 dark:text-emerald-300/70 font-medium block mb-1">Data de Entrega</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Story Points */}
            <div>
              <span className="text-emerald-900/70 dark:text-emerald-300/70 font-medium block mb-1">Story Points</span>
              <input
                type="number"
                min="0"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <span className="text-emerald-900/70 dark:text-emerald-300/70 font-medium block mb-1">Horas Estimadas</span>
              <input
                type="number"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Categories Selector (1 or multiple) */}
          <div className="p-4 rounded-xl bg-[#edf5f0]/60 dark:bg-[#081a13]/80 border border-[#d2e4d8] dark:border-[#163a2d]">
            <CategorySelector
              selectedCategories={tags}
              onChange={setTags}
              label="Categorias do Card (Selecione 1 ou Várias)"
              helperText="Ex: Documentação, Front-end, Back-end, Banco de Dados, Deploy..."
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  Descrição (Markdown)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewDesc(!isPreviewDesc)}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-medium"
              >
                {isPreviewDesc ? 'Editar' : 'Visualizar Markdown'}
              </button>
            </div>

            {isPreviewDesc ? (
              <div className="p-4 rounded-xl bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] text-sm text-slate-800 dark:text-slate-200 prose dark:prose-invert max-w-none min-h-[100px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description || '*Sem descrição informada.*'}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Insira detalhes da tarefa, referências ou critérios..."
                className="w-full bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-xl p-3 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-emerald-400/40 focus:outline-none focus:border-emerald-600 font-mono"
              />
            )}
          </div>

          {/* Checklists */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  Checklist ({checklists.filter((c) => c.isCompleted).length}/{checklists.length})
                </span>
              </div>
            </div>

            {/* Checklists list */}
            <div className="space-y-1.5">
              {checklists.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-colors"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={ch.isCompleted}
                      onChange={() => toggleChecklist(ch.id)}
                      className="rounded border-[#d2e4d8] dark:border-[#163a2d] text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span
                      className={`text-xs ${
                        ch.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {ch.title}
                    </span>
                  </label>
                  <button
                    onClick={() => removeChecklist(ch.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add checklist input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Novo item de checklist..."
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklist())}
                  className="flex-1 bg-white dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-emerald-400/40 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={addChecklist}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#edf5f0] hover:bg-[#e2efe6] dark:bg-[#123326] dark:hover:bg-[#163c2f] text-emerald-900 dark:text-emerald-200"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d2e4d8] dark:border-[#163a2d] flex items-center justify-end gap-3 bg-[#edf5f0] dark:bg-[#081a13]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-[#0c221a] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
