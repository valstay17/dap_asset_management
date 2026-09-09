import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Asset, NewAsset } from '../models/Asset';

export interface AssetPort {
  list(): Observable<Asset[]>;
  create(asset: NewAsset): Observable<Asset>;
  update(id: string, changes: NewAsset): Observable<Asset>;
  delete(id: string): Observable<void>;
}

export const ASSET_PORT = new InjectionToken<AssetPort>('ASSET_PORT');
