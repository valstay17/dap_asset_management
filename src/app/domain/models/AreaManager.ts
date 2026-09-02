export interface AreaManager {
  id: string;
  name: string;
  entity: string;
}

export type NewAreaManager = Omit<AreaManager, 'id'>;
