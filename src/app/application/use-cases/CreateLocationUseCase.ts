import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LOCATION_PORT, LocationPort } from '../../domain/ports/LocationPort';
import { NewSiteLocation, SiteLocation } from '../../domain/models/SiteLocation';
import { LocationStore } from '../LocationStore';

@Injectable({ providedIn: 'root' })
export class CreateLocationUseCase {
  constructor(
    @Inject(LOCATION_PORT) private readonly locationPort: LocationPort,
    private readonly locationStore: LocationStore,
  ) {}

  execute(input: NewSiteLocation): Observable<SiteLocation> {
    return this.locationPort.create(input).pipe(tap((location) => this.locationStore.addLocation(location)));
  }
}
