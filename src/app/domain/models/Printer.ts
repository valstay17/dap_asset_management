export interface Printer {
  id: string;
  inventoryNumber: string;
  brand: string;
  type: string;
  serialNumber: string;
  locationId: string;
  manufacturer: string;
  active: boolean;
}

export type NewPrinter = Omit<Printer, 'id'>;
