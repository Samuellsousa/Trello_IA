import { NextResponse } from 'next/server';
import { listProjectDocsUseCase, uploadProjectDocUseCase } from '@/infrastructure/container';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-default';
    const docs = await listProjectDocsUseCase.execute(boardId);
    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar documentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, fileName, content, boardId = 'board-default', autoExtractStack = true } = body;

    if (!fileName || !content) {
      return NextResponse.json({ error: 'Nome do arquivo e conteúdo são obrigatórios' }, { status: 400 });
    }

    const doc = await uploadProjectDocUseCase.execute(
      {
        boardId,
        title: title || fileName,
        fileName,
        content,
      },
      autoExtractStack
    );

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao salvar documento' }, { status: 500 });
  }
}
