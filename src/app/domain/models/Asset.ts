export type AssetStatus = 'activo' | 'mantenimiento' | 'baja';

export interface Asset {
  id: string;
  name: string;
  userId: string;
  user: string;
  custodianId: string;
  custodian: string;
  entityId: string;
  entity: string;
  manufacturer: string;
  serialNumber: string;
  inventoryNumber: string;
  typeId: string;
  type: string;
  model: string;
  operatingSystem: string;
  locationId: string;
  location: string;
  processor: string;
  memoryRAM: string;
  hardDiskType: string;
  hardDiskCapacity: string;
  processorNumber: string;
  networkAddress: string;
  macAddress: string;
  macAddressNetwork: string;
  updatedAt: string;
}

export interface NewAsset {
  name: string;
  userId: string;
  custodianId: string;
  entityId: string;
  manufacturer: string;
  serialNumber: string;
  inventoryNumber: string;
  typeId: string;
  model: string;
  operatingSystem: string;
  locationId: string;
  processor: string;
  memoryRAM: string;
  hardDiskType: string;
  hardDiskCapacity: string;
  processorNumber: string;
  networkAddress: string;
  macAddress: string;
  macAddressNetwork: string;
}
