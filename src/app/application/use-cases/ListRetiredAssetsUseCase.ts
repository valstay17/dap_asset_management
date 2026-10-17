import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ASSET_PORT, AssetPort } from '../../domain/ports/AssetPort';
import { Asset } from '../../domain/models/Asset';
import { AssetStore } from '../AssetStore';

@Injectable({ providedIn: 'root' })
export class ListRetiredAssetsUseCase {
  constructor(
    @Inject(ASSET_PORT) private readonly assetPort: AssetPort,
    private readonly assetStore: AssetStore,
  ) {}

  execute(): Observable<Asset[]> {
    return this.assetPort.listRetired().pipe(tap((assets) => this.assetStore.setRetiredAssets(assets)));
  }
}
