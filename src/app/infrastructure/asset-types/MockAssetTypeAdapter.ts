import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AssetTypePort } from '../../domain/ports/AssetTypePort';
import { AssetType, NewAssetType } from '../../domain/models/AssetType';

const LATENCY_MS = 500;

let seedAssetTypes: AssetType[] = [
  { id: '1', name: 'Desktop', active: true },
  { id: '2', name: 'Laptop', active: true },
  { id: '3', name: 'Monitor', active: true },
  { id: '4', name: 'Teclado', active: true },
  { id: '5', name: 'Teléfono', active: true },
  { id: '6', name: 'Cloud', active: true },
];

@Injectable({ providedIn: 'root' })
export class MockAssetTypeAdapter implements AssetTypePort {
  list(): Observable<AssetType[]> {
    return of([...seedAssetTypes]).pipe(delay(LATENCY_MS));
  }

  create(input: NewAssetType): Observable<AssetType> {
    const type: AssetType = { ...input, id: `${seedAssetTypes.length + 1}-${Date.now()}`, active: true };
    seedAssetTypes = [...seedAssetTypes, type];
    return of(type).pipe(delay(LATENCY_MS));
  }
}
