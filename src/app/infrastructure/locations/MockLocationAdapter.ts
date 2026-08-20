import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { LocationPort } from '../../domain/ports/LocationPort';
import { NewSiteLocation, SiteLocation } from '../../domain/models/SiteLocation';

const LATENCY_MS = 500;

let seedLocations: SiteLocation[] = [
  { id: '1', building: 'Edificio N', address: 'Canal de Apatlaco, Iztacalco, CDMX', floor: 'planta-alta' },
  { id: '2', building: 'Edificio M', address: 'Canal de Apatlaco, Iztacalco, CDMX', floor: 'planta-baja' },
  { id: '3', building: 'Edificio S', address: 'Canal de Apatlaco, CDMX' },
  { id: '4', building: 'Laboratorio de Alumbrado Público', address: 'Lebrija 196, Iztapalapa, CDMX' },
];

@Injectable({ providedIn: 'root' })
export class MockLocationAdapter implements LocationPort {
  list(): Observable<SiteLocation[]> {
    return of([...seedLocations]).pipe(delay(LATENCY_MS));
  }

  create(input: NewSiteLocation): Observable<SiteLocation> {
    const location: SiteLocation = { ...input, id: `${seedLocations.length + 1}-${Date.now()}` };
    seedLocations = [...seedLocations, location];
    return of(location).pipe(delay(LATENCY_MS));
  }
}
