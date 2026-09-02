import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ASSET_TYPE_PORT, AssetTypePort } from '../../domain/ports/AssetTypePort';
import { AssetType, NewAssetType } from '../../domain/models/AssetType';
import { AssetTypeStore } from '../AssetTypeStore';

@Injectable({ providedIn: 'root' })
export class CreateAssetTypeUseCase {
  constructor(
    @Inject(ASSET_TYPE_PORT) private readonly assetTypePort: AssetTypePort,
    private readonly assetTypeStore: AssetTypeStore,
  ) {}

  execute(input: NewAssetType): Observable<AssetType> {
    return this.assetTypePort.create(input).pipe(tap((assetType) => this.assetTypeStore.addAssetType(assetType)));
  }
}
