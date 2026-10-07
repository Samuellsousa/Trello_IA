import { NextResponse } from 'next/server';
import { extractTechStackFromMdUseCase } from '@/infrastructure/container';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markdownContent, boardId = 'board-default', fileName, applyToBoard = true } = body;

    if (!markdownContent || typeof markdownContent !== 'string') {
      return NextResponse.json({ error: 'Conteúdo markdown obrigatório' }, { status: 400 });
    }

    const result = await extractTechStackFromMdUseCase.execute({
      markdownContent,
      boardId,
      fileName,
      applyToBoard,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao extrair stack' }, { status: 500 });
  }
}
