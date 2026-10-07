export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  wipLimit?: number;
}
