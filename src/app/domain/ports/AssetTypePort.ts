import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetType, NewAssetType } from '../models/AssetType';

export interface AssetTypePort {
  list(): Observable<AssetType[]>;
  create(type: NewAssetType): Observable<AssetType>;
}

export const ASSET_TYPE_PORT = new InjectionToken<AssetTypePort>('ASSET_TYPE_PORT');
