import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AreaManagerPort } from '../../domain/ports/AreaManagerPort';
import { AreaManager, NewAreaManager } from '../../domain/models/AreaManager';

const LATENCY_MS = 500;

let seedAreaManagers: AreaManager[] = [
  { id: '1', name: 'Juan Carlos Mendoza', entity: 'Área de tecnologías de la Información y Comunicaciones' },
  { id: '2', name: 'María Fernanda López', entity: 'Recursos Humanos de la DAP' },
  { id: '3', name: 'Roberto Sánchez Ortiz', entity: 'Subdirección de Operación y Mantenimiento' },
];

@Injectable({ providedIn: 'root' })
export class MockAreaManagerAdapter implements AreaManagerPort {
  list(): Observable<AreaManager[]> {
    return of([...seedAreaManagers]).pipe(delay(LATENCY_MS));
  }

  create(input: NewAreaManager): Observable<AreaManager> {
    const areaManager: AreaManager = { ...input, id: `${seedAreaManagers.length + 1}-${Date.now()}` };
    seedAreaManagers = [...seedAreaManagers, areaManager];
    return of(areaManager).pipe(delay(LATENCY_MS));
  }
}
