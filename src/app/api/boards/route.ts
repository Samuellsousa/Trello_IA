import { NextResponse } from 'next/server';
import { listBoardsSummaryUseCase, createBoardUseCase } from '@/infrastructure/container';

export async function GET() {
  try {
    const projects = await listBoardsSummaryUseCase.execute();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar projetos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = {
      name: body.name,
      description: body.description,
      colorTheme: body.colorTheme,
      initialTechs: body.initialTechs || body.techStackNames || [],
    };
    const board = await createBoardUseCase.execute(dto);
    return NextResponse.json(board, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar projeto' }, { status: 400 });
  }
}
