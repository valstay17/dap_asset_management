import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ASSET_PORT, AssetPort } from '../../domain/ports/AssetPort';
import { AssetStore } from '../AssetStore';

@Injectable({ providedIn: 'root' })
export class DeleteAssetUseCase {
  constructor(
    @Inject(ASSET_PORT) private readonly assetPort: AssetPort,
    private readonly assetStore: AssetStore,
  ) {}

  execute(id: string): Observable<void> {
    return this.assetPort.delete(id).pipe(tap(() => this.assetStore.removeAsset(id)));
  }
}
