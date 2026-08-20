import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NewUser, User, UserStatus } from '../models/User';

export interface UserPort {
  list(): Observable<User[]>;
  create(user: NewUser): Observable<User>;
  updateStatus(id: string, status: UserStatus): Observable<User>;
}

export const USER_PORT = new InjectionToken<UserPort>('USER_PORT');
