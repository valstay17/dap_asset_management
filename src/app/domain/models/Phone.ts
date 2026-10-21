export interface Phone {
  id: string;
  userId: string;
  inventoryNumber: string;
  brand: string;
  model: string;
  serialNumber: string;
  entityId: string;
  networkAddress: string;
  extension: string;
  active: boolean;
}

export type NewPhone = Omit<Phone, 'id'>;
