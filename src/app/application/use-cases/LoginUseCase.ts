import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AUTH_PORT, AuthPort, Credentials } from '../../domain/ports/AuthPort';
import { AuthSession } from '../../domain/models/AuthSession';
import { SessionStore } from '../SessionStore';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    private readonly sessionStore: SessionStore,
  ) {}

  execute(credentials: Credentials): Observable<AuthSession> {
    return this.authPort
      .login(credentials)
      .pipe(tap((session) => this.sessionStore.setSession(session)));
  }
}
