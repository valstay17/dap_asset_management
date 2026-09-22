import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { AuthPort, Credentials } from '../../domain/ports/AuthPort';
import { AuthSession } from '../../domain/models/AuthSession';

const MOCK_ACCOUNT = {
  username: 'admin',
  password: 'Admin123*',
  id: '1',
  name: 'Administrador',
  email: 'admin@cdmx.gob.mx',
};

const MOCK_LATENCY_MS = 600;

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthPort {
  login(credentials: Credentials): Observable<AuthSession> {
    
    const session: AuthSession = {
      token: `mock-token-${MOCK_ACCOUNT.id}`,
      user: {
        idUser: MOCK_ACCOUNT.id,
        name: MOCK_ACCOUNT.name,
        mail: MOCK_ACCOUNT.email,
      },
    };

    return of(session).pipe(delay(MOCK_LATENCY_MS));
  }
}
