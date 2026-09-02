import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AREA_MANAGER_PORT, AreaManagerPort } from '../../domain/ports/AreaManagerPort';
import { AreaManager, NewAreaManager } from '../../domain/models/AreaManager';
import { AreaManagerStore } from '../AreaManagerStore';

@Injectable({ providedIn: 'root' })
export class CreateAreaManagerUseCase {
  constructor(
    @Inject(AREA_MANAGER_PORT) private readonly areaManagerPort: AreaManagerPort,
    private readonly areaManagerStore: AreaManagerStore,
  ) {}

  execute(input: NewAreaManager): Observable<AreaManager> {
    return this.areaManagerPort
      .create(input)
      .pipe(tap((areaManager) => this.areaManagerStore.addAreaManager(areaManager)));
  }
}
