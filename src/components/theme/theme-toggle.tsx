'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
      className={`inline-flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
        isDark
          ? 'bg-slate-800/80 text-yellow-300 hover:bg-slate-850 hover:text-yellow-200 border border-slate-700/60'
          : 'bg-slate-100 text-indigo-700 hover:bg-slate-200 border border-slate-300 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
    </button>
  );
}
