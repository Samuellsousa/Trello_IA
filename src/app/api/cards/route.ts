import { NextResponse } from 'next/server';
import { createCardUseCase, moveCardUseCase } from '@/infrastructure/container';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const card = await createCardUseCase.execute(body);
    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar cartão' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { cardId, targetColumnId, newOrder } = body;
    if (!cardId || !targetColumnId || newOrder === undefined) {
      return NextResponse.json({ error: 'Parâmetros inválidos para movimentação' }, { status: 400 });
    }
    const moved = await moveCardUseCase.execute(cardId, targetColumnId, newOrder);
    return NextResponse.json(moved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao mover cartão' }, { status: 400 });
  }
}
