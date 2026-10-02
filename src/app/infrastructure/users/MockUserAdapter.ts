import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { UserPort } from '../../domain/ports/UserPort';
import { NewUser, User, UserStatus } from '../../domain/models/User';

const LATENCY_MS = 500;

let seedUsers: User[] = [
  {
    id: '1',
    firstName: 'Ricardo',
    lastName: 'Hernández',
    entityId: '2',
    entity: 'Recursos Humanos de la DAP',
    locationId: '1',
    location: 'Edificio N — Canal de Apatlaco, Iztacalco, CDMX (Planta alta)',
    status: 'activo',
  },
  {
    id: '2',
    firstName: 'Adriana',
    lastName: 'Martínez',
    entityId: '1',
    entity: 'Area de Tecnologías de la Información y Comunicaciones',
    locationId: '2',
    location: 'Edificio M — Canal de Apatlaco, Iztacalco, CDMX (Planta baja)',
    status: 'inactivo',
  },
];

@Injectable({ providedIn: 'root' })
export class MockUserAdapter implements UserPort {
  list(): Observable<User[]> {
    return of([...seedUsers]).pipe(delay(LATENCY_MS));
  }

  create(input: NewUser): Observable<User> {
    const user: User = {
      ...input,
      id: `${seedUsers.length + 1}-${Date.now()}`,
      entity: input.entityId,
      location: input.locationId,
      status: 'activo',
    };
    seedUsers = [user, ...seedUsers];
    return of(user).pipe(delay(LATENCY_MS));
  }

  updateStatus(user: User, status: UserStatus): Observable<User> {
    const existing = seedUsers.find((seed) => seed.id === user.id);
    if (!existing) {
      return throwError(() => new Error('Usuario no encontrado')).pipe(delay(LATENCY_MS));
    }

    const updated: User = { ...existing, status };
    seedUsers = seedUsers.map((seed) => (seed.id === user.id ? updated : seed));
    return of(updated).pipe(delay(LATENCY_MS));
  }
}
