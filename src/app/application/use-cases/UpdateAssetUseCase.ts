import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ASSET_PORT, AssetPort } from '../../domain/ports/AssetPort';
import { Asset, NewAsset } from '../../domain/models/Asset';
import { AssetStore } from '../AssetStore';

@Injectable({ providedIn: 'root' })
export class UpdateAssetUseCase {
  constructor(
    @Inject(ASSET_PORT) private readonly assetPort: AssetPort,
    private readonly assetStore: AssetStore,
  ) {}

  execute(id: string, changes: NewAsset): Observable<Asset> {
    return this.assetPort.update(id, changes).pipe(tap((asset) => this.assetStore.updateAsset(asset)));
  }
}
