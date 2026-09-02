import { Injectable, computed, signal } from '@angular/core';
import { AreaManager } from '../domain/models/AreaManager';

@Injectable({ providedIn: 'root' })
export class AreaManagerStore {
  private readonly areaManagersState = signal<AreaManager[]>([]);

  readonly areaManagers = this.areaManagersState.asReadonly();
  readonly total = computed(() => this.areaManagersState().length);

  setAreaManagers(areaManagers: AreaManager[]): void {
    this.areaManagersState.set(areaManagers);
  }

  addAreaManager(areaManager: AreaManager): void {
    this.areaManagersState.update((areaManagers) => [...areaManagers, areaManager]);
  }
}
