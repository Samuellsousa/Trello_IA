import { NextResponse } from 'next/server';
import { analyzeBoardBottlenecksUseCase } from '@/infrastructure/container';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-default';
    const alerts = await analyzeBoardBottlenecksUseCase.execute(boardId);
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao analisar gargalos' }, { status: 500 });
  }
}
