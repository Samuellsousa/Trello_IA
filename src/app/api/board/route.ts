import { NextResponse } from 'next/server';
import { getBoardDetailsUseCase } from '@/infrastructure/container';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-default';
    const board = await getBoardDetailsUseCase.execute(boardId);

    if (!board) {
      return NextResponse.json({ error: 'Quadro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
