import { NextResponse } from 'next/server';
import { generateCardFromPromptUseCase } from '@/infrastructure/container';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, boardId = 'board-default', targetColumnId, autoCreate = false } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'O prompt de atividade é obrigatório' }, { status: 400 });
    }

    const result = await generateCardFromPromptUseCase.execute({
      prompt,
      boardId,
      targetColumnId,
      autoCreate,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar prompt com IA' }, { status: 500 });
  }
}
