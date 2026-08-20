import { Injectable, signal } from '@angular/core';
import { Asset } from '../domain/models/Asset';

@Injectable({ providedIn: 'root' })
export class AssetStore {
  private readonly assetsState = signal<Asset[]>([]);

  readonly assets = this.assetsState.asReadonly();

  setAssets(assets: Asset[]): void {
    this.assetsState.set(assets);
  }

  addAsset(asset: Asset): void {
    this.assetsState.update((assets) => [asset, ...assets]);
  }
}
