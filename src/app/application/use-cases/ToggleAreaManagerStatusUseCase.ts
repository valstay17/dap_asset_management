import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AREA_MANAGER_PORT, AreaManagerPort } from '../../domain/ports/AreaManagerPort';
import { AreaManager } from '../../domain/models/AreaManager';
import { AreaManagerStore } from '../AreaManagerStore';

@Injectable({ providedIn: 'root' })
export class ToggleAreaManagerStatusUseCase {
  constructor(
    @Inject(AREA_MANAGER_PORT) private readonly areaManagerPort: AreaManagerPort,
    private readonly areaManagerStore: AreaManagerStore,
  ) {}

  execute(areaManager: AreaManager): Observable<AreaManager> {
    return this.areaManagerPort
      .updateStatus(areaManager, !areaManager.active)
      .pipe(tap((updated) => this.areaManagerStore.updateAreaManager(updated)));
  }
}
