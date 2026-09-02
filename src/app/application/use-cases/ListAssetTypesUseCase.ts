import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ASSET_TYPE_PORT, AssetTypePort } from '../../domain/ports/AssetTypePort';
import { AssetType } from '../../domain/models/AssetType';
import { AssetTypeStore } from '../AssetTypeStore';

@Injectable({ providedIn: 'root' })
export class ListAssetTypesUseCase {
  constructor(
    @Inject(ASSET_TYPE_PORT) private readonly assetTypePort: AssetTypePort,
    private readonly assetTypeStore: AssetTypeStore,
  ) {}

  execute(): Observable<AssetType[]> {
    return this.assetTypePort.list().pipe(tap((assetTypes) => this.assetTypeStore.setAssetTypes(assetTypes)));
  }
}
