import { NextResponse } from 'next/server';
import { getBoardDetailsUseCase, calculateBoardMetricsUseCase, analyzeBoardBottlenecksUseCase } from '@/infrastructure/container';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-default';

    const board = await getBoardDetailsUseCase.execute(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Quadro não encontrado' }, { status: 404 });
    }

    let aiBottlenecks: any[] = [];
    try {
      aiBottlenecks = await analyzeBoardBottlenecksUseCase.execute(boardId);
    } catch (e) {
      // Ignora falhas da IA para manter métricas sempre online
    }

    const metrics = calculateBoardMetricsUseCase.execute(board, aiBottlenecks);
    return NextResponse.json({ board, metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao calcular métricas' }, { status: 500 });
  }
}
