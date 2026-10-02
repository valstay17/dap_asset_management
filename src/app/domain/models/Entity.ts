export interface Entity {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  active: boolean;
}

export interface NewEntity {
  name: string;
  level: number;
  parentId: string | null;
}
