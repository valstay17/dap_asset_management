import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LOCATION_PORT, LocationPort } from '../../domain/ports/LocationPort';
import { SiteLocation } from '../../domain/models/SiteLocation';
import { LocationStore } from '../LocationStore';

@Injectable({ providedIn: 'root' })
export class ListLocationsUseCase {
  constructor(
    @Inject(LOCATION_PORT) private readonly locationPort: LocationPort,
    private readonly locationStore: LocationStore,
  ) {}

  execute(): Observable<SiteLocation[]> {
    return this.locationPort.list().pipe(tap((locations) => this.locationStore.setLocations(locations)));
  }
}
