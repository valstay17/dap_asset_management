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
    email: 'r.hernandez@assetprecision.com',
    entity: 'Recursos Humanos de la DAP',
    department: 'Dirección General',
    location: 'Edificio N — Canal de Apatlaco, Iztacalco, CDMX (Planta alta)',
    status: 'activo',
  },
  {
    id: '2',
    firstName: 'Adriana',
    lastName: 'Martínez',
    email: 'a.martinez@it-division.com',
    entity: 'Area de Tecnologías de la Información y Comunicaciones',
    department: 'Tecnologías de Información',
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
    const slug = `${input.firstName[0] ?? ''}.${input.lastName}`.toLowerCase().replace(/\s+/g, '');
    const user: User = {
      ...input,
      id: `${seedUsers.length + 1}-${Date.now()}`,
      email: `${slug}@assetprecision.com`,
      status: 'activo',
    };
    seedUsers = [user, ...seedUsers];
    return of(user).pipe(delay(LATENCY_MS));
  }

  updateStatus(id: string, status: UserStatus): Observable<User> {
    const existing = seedUsers.find((user) => user.id === id);
    if (!existing) {
      return throwError(() => new Error('Usuario no encontrado')).pipe(delay(LATENCY_MS));
    }

    const updated: User = { ...existing, status };
    seedUsers = seedUsers.map((user) => (user.id === id ? updated : user));
    return of(updated).pipe(delay(LATENCY_MS));
  }
}
