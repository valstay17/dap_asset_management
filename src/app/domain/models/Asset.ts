export type AssetStatus = 'activo' | 'mantenimiento' | 'baja';

export interface Asset {
  id: string;
  name: string;
  user: string;
  entity: string;
  manufacturer: string;
  serialNumber: string;
  inventoryNumber: string;
  type: string;
  model: string;
  operatingSystem: string;
  location: string;
  processor: string;
  memoryRAM: string;
  hardDiskType: string;
  hardDiskCapacity: string;
  processorNumber: string;
  networkAddress: string;
  macAddress: string;
  macAddressNetwork: string;

}

export type NewAsset = Omit<Asset, 'id'>;
