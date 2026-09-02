import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AREA_MANAGER_PORT, AreaManagerPort } from '../../domain/ports/AreaManagerPort';
import { AreaManager } from '../../domain/models/AreaManager';
import { AreaManagerStore } from '../AreaManagerStore';

@Injectable({ providedIn: 'root' })
export class ListAreaManagersUseCase {
  constructor(
    @Inject(AREA_MANAGER_PORT) private readonly areaManagerPort: AreaManagerPort,
    private readonly areaManagerStore: AreaManagerStore,
  ) {}

  execute(): Observable<AreaManager[]> {
    return this.areaManagerPort
      .list()
      .pipe(tap((areaManagers) => this.areaManagerStore.setAreaManagers(areaManagers)));
  }
}
