import { Injectable, signal } from '@angular/core';
import { AssetType } from '../domain/models/AssetType';

@Injectable({ providedIn: 'root' })
export class AssetTypeStore {
  private readonly assetTypesState = signal<AssetType[]>([]);

  readonly assetTypes = this.assetTypesState.asReadonly();

  setAssetTypes(assetTypes: AssetType[]): void {
    this.assetTypesState.set(assetTypes);
  }

  addAssetType(assetType: AssetType): void {
    this.assetTypesState.update((assetTypes) => [...assetTypes, assetType]);
  }

  updateAssetType(assetType: AssetType): void {
    this.assetTypesState.update((assetTypes) =>
      assetTypes.map((existing) => (existing.id === assetType.id ? assetType : existing)),
    );
  }

  // Baja lógica: se conserva para resolver tipos en registros existentes.
  deactivateAssetType(id: string): void {
    this.assetTypesState.update((assetTypes) =>
      assetTypes.map((existing) => (existing.id === id ? { ...existing, active: false } : existing)),
    );
  }
}
