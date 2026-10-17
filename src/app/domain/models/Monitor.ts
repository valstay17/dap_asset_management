export interface Monitor {
  id: string;
  inventoryNumber: string;
  brand: string;
  model: string;
  serialNumber: string;
  entityId: string;
  networkAddress: string;
  active: boolean;
}

export type NewMonitor = Omit<Monitor, 'id'>;
