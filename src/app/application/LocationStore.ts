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

  updateLocation(location: SiteLocation): void {
    this.locationsState.update((locations) =>
      locations.map((existing) => (existing.id === location.id ? location : existing)),
    );
  }

  // Baja lógica: se conserva para resolver ubicaciones en registros existentes.
  deactivateLocation(id: string): void {
    this.locationsState.update((locations) =>
      locations.map((existing) => (existing.id === id ? { ...existing, active: false } : existing)),
    );
  }
}
