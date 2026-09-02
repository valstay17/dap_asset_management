import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AssetTypePort } from '../../domain/ports/AssetTypePort';
import { AssetType, NewAssetType } from '../../domain/models/AssetType';

const LATENCY_MS = 500;

let seedAssetTypes: AssetType[] = [
  { id: '1', name: 'Desktop' },
  { id: '2', name: 'Laptop' },
  { id: '3', name: 'Monitor' },
  { id: '4', name: 'Teclado' },
  { id: '5', name: 'Teléfono' },
  { id: '6', name: 'Cloud' },
];

@Injectable({ providedIn: 'root' })
export class MockAssetTypeAdapter implements AssetTypePort {
  list(): Observable<AssetType[]> {
    return of([...seedAssetTypes]).pipe(delay(LATENCY_MS));
  }

  create(input: NewAssetType): Observable<AssetType> {
    const type: AssetType = { ...input, id: `${seedAssetTypes.length + 1}-${Date.now()}` };
    seedAssetTypes = [...seedAssetTypes, type];
    return of(type).pipe(delay(LATENCY_MS));
  }
}
