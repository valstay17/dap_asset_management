export interface AreaManager {
  id: string;
  name: string;
  entityId: string;
  entity: string;
  active: boolean;
}

export interface NewAreaManager {
  name: string;
  entityId: string;
}
