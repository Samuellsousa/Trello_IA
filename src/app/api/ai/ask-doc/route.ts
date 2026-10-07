import { NextResponse } from 'next/server';
import { queryDocumentAssistantUseCase } from '@/infrastructure/container';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, boardId = 'board-default' } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 });
    }

    const result = await queryDocumentAssistantUseCase.execute({
      boardId,
      question,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao consultar assistente' }, { status: 500 });
  }
}
