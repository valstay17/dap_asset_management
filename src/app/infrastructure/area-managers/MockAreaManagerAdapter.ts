import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { AreaManagerPort } from '../../domain/ports/AreaManagerPort';
import { AreaManager, NewAreaManager } from '../../domain/models/AreaManager';

const LATENCY_MS = 500;

let seedAreaManagers: AreaManager[] = [
  { id: '1', name: 'Juan Carlos Mendoza', entityId: '1', entity: 'Área de tecnologías de la Información y Comunicaciones', active: true },
  { id: '2', name: 'María Fernanda López', entityId: '2', entity: 'Recursos Humanos de la DAP', active: true },
  { id: '3', name: 'Roberto Sánchez Ortiz', entityId: '3', entity: 'Subdirección de Operación y Mantenimiento', active: true },
];

@Injectable({ providedIn: 'root' })
export class MockAreaManagerAdapter implements AreaManagerPort {
  list(): Observable<AreaManager[]> {
    return of([...seedAreaManagers]).pipe(delay(LATENCY_MS));
  }

  create(input: NewAreaManager): Observable<AreaManager> {
    const areaManager: AreaManager = {
      id: `${seedAreaManagers.length + 1}-${Date.now()}`,
      name: input.name,
      entityId: input.entityId,
      entity: input.entityId,
      active: true,
    };
    seedAreaManagers = [...seedAreaManagers, areaManager];
    return of(areaManager).pipe(delay(LATENCY_MS));
  }

  updateStatus(areaManager: AreaManager, active: boolean): Observable<AreaManager> {
    const existing = seedAreaManagers.find((seed) => seed.id === areaManager.id);
    if (!existing) {
      return throwError(() => new Error('Jefe de área no encontrado')).pipe(delay(LATENCY_MS));
    }

    const updated: AreaManager = { ...existing, active };
    seedAreaManagers = seedAreaManagers.map((seed) => (seed.id === areaManager.id ? updated : seed));
    return of(updated).pipe(delay(LATENCY_MS));
  }
}
