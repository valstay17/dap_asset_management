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
}
