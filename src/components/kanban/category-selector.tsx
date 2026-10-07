'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Layout, 
  Server, 
  Database, 
  Rocket, 
  Cpu, 
  CheckCircle, 
  Layers, 
  Plus, 
  X,
  Check
} from 'lucide-react';
import { PREDEFINED_TASK_CATEGORIES, TaskCategoryDef } from '@/core/domain/constants/task-categories';

const ICON_MAP = {
  FileText,
  Layout,
  Server,
  Database,
  Rocket,
  Cpu,
  CheckCircle,
  Layers,
};

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  label?: string;
  helperText?: string;
}

export function CategorySelector({
  selectedCategories,
  onChange,
  label = 'Categorias do Card (Selecione 1 ou Várias)',
  helperText = 'Defina a área técnica ou responsabilidade da tarefa.',
}: CategorySelectorProps) {
  const [customTagInput, setCustomTagInput] = useState('');

  const toggleCategory = (catName: string) => {
    const isSelected = selectedCategories.some(
      (c) => c.toLowerCase() === catName.toLowerCase()
    );

    if (isSelected) {
      onChange(selectedCategories.filter((c) => c.toLowerCase() !== catName.toLowerCase()));
    } else {
      onChange([...selectedCategories, catName]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    const exists = selectedCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      onChange([...selectedCategories, trimmed]);
    }
    setCustomTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedCategories.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  // Identificar tags que são pré-definidas vs personalizadas
  const predefinedNamesLower = PREDEFINED_TASK_CATEGORIES.map((c) => c.name.toLowerCase());
  const customTags = selectedCategories.filter(
    (tag) => !predefinedNamesLower.includes(tag.toLowerCase())
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
            {label}
          </label>
          {helperText && (
            <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/60 mt-0.5">
              {helperText}
            </p>
          )}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-[#123326] text-emerald-900 dark:text-emerald-200 border border-emerald-300/70 dark:border-emerald-700/60">
          {selectedCategories.length} {selectedCategories.length === 1 ? 'selecionada' : 'selecionadas'}
        </span>
      </div>

      {/* Grid de Chips de Categorias Padrão */}
      <div className="flex flex-wrap gap-1.5">
        {PREDEFINED_TASK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.some(
            (c) => c.toLowerCase() === cat.name.toLowerCase()
          );
          const Icon = ICON_MAP[cat.iconName] || Layers;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.name)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all select-none border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-800 dark:bg-emerald-600 dark:border-emerald-500 shadow-xs scale-[1.02]'
                  : 'bg-[#edf5f0] dark:bg-[#0c231b] text-emerald-900/80 dark:text-emerald-300/80 border-[#d2e4d8] dark:border-[#163a2d] hover:bg-[#e2efe6] dark:hover:bg-[#113125] hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>{cat.name}</span>
              {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Tags personalizadas ativas + Campo de Adicionar Tag Customizada */}
      <div className="pt-2 border-t border-[#d2e4d8]/80 dark:border-[#163a2d]/80 flex items-center gap-2 flex-wrap">
        {customTags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 bg-[#edf5f0] dark:bg-[#0e2a20] text-emerald-900 dark:text-emerald-300 border border-[#d2e4d8] dark:border-[#184232] px-2 py-0.5 rounded-md text-[11px] font-medium"
          >
            #{t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-slate-400 hover:text-rose-500 ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="+ Tag personalizada"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTag();
              }
            }}
            className="bg-white dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] text-xs px-2.5 py-1 rounded-md text-slate-800 dark:text-slate-200 w-36 placeholder:text-slate-400 dark:placeholder:text-emerald-400/40 focus:outline-none focus:border-emerald-600"
          />
          {customTagInput.trim() && (
            <button
              type="button"
              onClick={addCustomTag}
              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
