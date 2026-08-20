import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthSession } from '../models/AuthSession';

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthPort {
  login(credentials: Credentials): Observable<AuthSession>;
}

export const AUTH_PORT = new InjectionToken<AuthPort>('AUTH_PORT');
