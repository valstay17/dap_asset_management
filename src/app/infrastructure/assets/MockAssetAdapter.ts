import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AssetPort } from '../../domain/ports/AssetPort';
import { Asset, NewAsset } from '../../domain/models/Asset';

const LATENCY_MS = 500;

let seedAssets: Asset[] = [
  {
    id: '1',
    name: 'DAP-001',
    userId: '1',
    user: 'Fernando Perez',
    custodianId: '1',
    custodian: 'Ricardo Hernández',
    entityId: '3',
    entity: 'Subducción de Operación y Mantenimiento - A1',
    serialNumber: 'LNV-0001',
    manufacturer: 'LENOVO',
    inventoryNumber: 'INV0101',
    locationId: '1',
    location: 'Edificio N - Planta baja',
    typeId: '1',
    type: 'Desktop',
    model: 'ThinkCentre M720q',
    operatingSystem: 'Windows 10 Pro',
    processor: 'Intel Core i5-9400T',
    memoryRAM: '8GB',
    hardDiskType: 'SSD',
    hardDiskCapacity: '256GB',
    processorNumber: 'i5-9400T',
    networkAddress: '192.168.000.0',
    macAddress: '00:1A:2B:3C:4D:5E',
    macAddressNetwork: '00:1A:2B:3C:4D:5F',
    updatedAt: '2026-08-12T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'DAP-002',
    userId: '2',
    user: 'Ricardo Hernández',
    custodianId: '1',
    custodian: 'Ricardo Hernández',
    entityId: '2',
    entity: 'Recursos Humanos de la DAP',
    serialNumber: 'HP-0002',
    manufacturer: 'HP',
    inventoryNumber: 'INV0102',
    locationId: '1',
    location: 'Edificio N — Canal de Apatlaco, Iztacalco, CDMX (Planta alta)',
    typeId: '2',
    type: 'Laptop',
    model: 'ProBook 440 G8',
    operatingSystem: 'Windows 11 Pro',
    processor: 'Intel Core i5-1135G7',
    memoryRAM: '16GB',
    hardDiskType: 'SSD',
    hardDiskCapacity: '512GB',
    processorNumber: 'i5-1135G7',
    networkAddress: '192.168.000.12',
    macAddress: '00:1B:2C:3D:4E:5F',
    macAddressNetwork: '00:1B:2C:3D:4E:60',
    updatedAt: '2026-08-20T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'DAP-003',
    userId: '3',
    user: 'Adriana Martínez',
    custodianId: '2',
    custodian: 'Adriana Martínez',
    entityId: '1',
    entity: 'Área de tecnologías de la Información y Comunicaciones',
    serialNumber: 'DL-0003',
    manufacturer: 'DELL',
    inventoryNumber: 'INV0103',
    locationId: '2',
    location: 'Edificio M — Canal de Apatlaco, Iztacalco, CDMX (Planta baja)',
    typeId: '1',
    type: 'Desktop',
    model: 'OptiPlex 3080',
    operatingSystem: 'Windows 10 Pro',
    processor: 'Intel Core i7-10700',
    memoryRAM: '16GB',
    hardDiskType: 'SSD',
    hardDiskCapacity: '512GB',
    processorNumber: 'i7-10700',
    networkAddress: '192.168.000.13',
    macAddress: '00:1C:2D:3E:4F:60',
    macAddressNetwork: '00:1C:2D:3E:4F:61',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'DAP-004',
    userId: '2',
    user: 'Ricardo Hernández',
    custodianId: '2',
    custodian: 'Adriana Martínez',
    entityId: '3',
    entity: 'Subdirección de Operación y Mantenimiento',
    serialNumber: 'LNV-0004',
    manufacturer: 'LENOVO',
    inventoryNumber: 'INV0104',
    locationId: '3',
    location: 'Edificio S — Canal de Apatlaco, CDMX',
    typeId: '2',
    type: 'Laptop',
    model: 'ThinkPad E14',
    operatingSystem: 'Windows 11 Pro',
    processor: 'AMD Ryzen 5 5500U',
    memoryRAM: '8GB',
    hardDiskType: 'SSD',
    hardDiskCapacity: '256GB',
    processorNumber: 'Ryzen 5 5500U',
    networkAddress: '192.168.000.14',
    macAddress: '00:1D:2E:3F:40:61',
    macAddressNetwork: '00:1D:2E:3F:40:62',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
];

let retiredAssets: Asset[] = [];

@Injectable({ providedIn: 'root' })
export class MockAssetAdapter implements AssetPort {
  list(): Observable<Asset[]> {
    return of([...seedAssets]).pipe(delay(LATENCY_MS));
  }

  create(input: NewAsset): Observable<Asset> {
    const asset: Asset = {
      ...input,
      id: `${seedAssets.length + 1}-${Date.now()}`,
      user: input.userId,
      custodian: input.custodianId,
      entity: input.entityId,
      type: input.typeId,
      location: input.locationId,
      updatedAt: new Date().toISOString(),
    };
    seedAssets = [asset, ...seedAssets];
    return of(asset).pipe(delay(LATENCY_MS));
  }

  update(id: string, changes: NewAsset): Observable<Asset> {
    const asset: Asset = {
      ...changes,
      id,
      user: changes.userId,
      custodian: changes.custodianId,
      entity: changes.entityId,
      type: changes.typeId,
      location: changes.locationId,
      updatedAt: new Date().toISOString(),
    };
    seedAssets = seedAssets.map((existing) => (existing.id === id ? asset : existing));
    return of(asset).pipe(delay(LATENCY_MS));
  }

  delete(id: string): Observable<void> {
    seedAssets = seedAssets.filter((existing) => existing.id !== id);
    return of(undefined).pipe(delay(LATENCY_MS));
  }

  listRetired(): Observable<Asset[]> {
    return of([...retiredAssets]).pipe(delay(LATENCY_MS));
  }

  retire(asset: Asset): Observable<Asset> {
    const retired: Asset = { ...asset, updatedAt: new Date().toISOString() };
    seedAssets = seedAssets.filter((existing) => existing.id !== asset.id);
    retiredAssets = [retired, ...retiredAssets];
    return of(retired).pipe(delay(LATENCY_MS));
  }
}
