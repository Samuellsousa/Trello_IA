import { Board, BoardAggregate, CreateBoardDTO, ProjectSummary } from '../entities/board.entity';
import { Card, CreateCardDTO } from '../entities/card.entity';
import { Column } from '../entities/column.entity';
import { ProjectTechStack } from '../entities/tech-stack.entity';

export interface IBoardRepository {
  getBoardAggregate(boardId: string): Promise<BoardAggregate | null>;
  listBoards(): Promise<Board[]>;
  listProjectsSummary(): Promise<ProjectSummary[]>;
  createBoard(dto: CreateBoardDTO): Promise<Board>;
  createCard(dto: CreateCardDTO): Promise<Card>;
  updateCard(cardId: string, partial: Partial<Card>): Promise<Card>;
  deleteCard(cardId: string): Promise<boolean>;
  moveCard(cardId: string, targetColumnId: string, newOrder: number): Promise<Card>;
  createColumn(boardId: string, title: string): Promise<Column>;
  updateTechStack(boardId: string, techStack: ProjectTechStack): Promise<Board>;
}
