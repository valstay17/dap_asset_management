import { Injectable, signal } from '@angular/core';
import { SiteLocation } from '../domain/models/SiteLocation';

@Injectable({ providedIn: 'root' })
export class LocationStore {
  private readonly locationsState = signal<SiteLocation[]>([]);

  readonly locations = this.locationsState.asReadonly();

  setLocations(locations: SiteLocation[]): void {
    this.locationsState.set(locations);
  }

  addLocation(location: SiteLocation): void {
    this.locationsState.update((locations) => [...locations, location]);
  }
}
