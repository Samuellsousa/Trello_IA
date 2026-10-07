import Link from 'next/link';
import { ArrowLeft, FolderX } from 'lucide-react';
import { getBoardDetailsUseCase } from '@/infrastructure/container';
import { BoardView } from '@/components/kanban/board-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface BoardPageProps {
  params: {
    boardId: string;
  };
}

export default async function DynamicBoardPage({ params }: BoardPageProps) {
  const { boardId } = params;
  const board = await getBoardDetailsUseCase.execute(boardId);

  if (!board) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f8faf9] dark:bg-[#071712]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-[#123025] text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
          <FolderX className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Projeto não encontrado
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          O projeto solicitado com identificador "{boardId}" não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Hub de Projetos</span>
        </Link>
      </div>
    );
  }

  return <BoardView initialBoard={board} />;
}
