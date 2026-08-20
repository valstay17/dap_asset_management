export interface Entity {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
}

export interface NewEntity {
  name: string;
  level: number;
  parentId: string;
}
