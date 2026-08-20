import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { EntityPort } from '../../domain/ports/EntityPort';
import { Entity, NewEntity } from '../../domain/models/Entity';

const LATENCY_MS = 500;

let seedEntities: Entity[] = [
  { id: 'dap', name: 'Dirección de Alumbrado Público', level: 0, parentId: null },
  { id: '1', name: 'Área de tecnologías de la Información y Comunicaciones', level: 1, parentId: 'dap' },
  { id: '2', name: 'Recursos Humanos de la DAP', level: 1, parentId: 'dap' },
  { id: '3', name: 'Subdirección de Operación y Mantenimiento', level: 1, parentId: 'dap' },
  { id: '4', name: 'Recursos Humanos de la SOM', level: 2, parentId: '3' },
  { id: '5', name: 'Oficina de combustibles', level: 2, parentId: '3' },
  { id: '6', name: 'Almacén Campamento Hualquila', level: 2, parentId: '3' },
  { id: '7', name: 'Subdirección Técnica de Alumbrado Público', level: 1, parentId: 'dap' },
  { id: '8', name: 'JUD de Facturación de Servicios de Electricidad', level: 2, parentId: '7' },
  { id: '9', name: 'JUD de Mantenimiento de Alumbrado Público A2', level: 2, parentId: '3' },
  { id: '10', name: 'Campamento Obra Civil', level: 3, parentId: '9' },
];

@Injectable({ providedIn: 'root' })
export class MockEntityAdapter implements EntityPort {
  list(): Observable<Entity[]> {
    return of([...seedEntities]).pipe(delay(LATENCY_MS));
  }

  create(input: NewEntity): Observable<Entity> {
    const entity: Entity = { ...input, id: `${seedEntities.length + 1}-${Date.now()}` };
    seedEntities = [...seedEntities, entity];
    return of(entity).pipe(delay(LATENCY_MS));
  }
}
