import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { USER_PORT, UserPort } from '../../domain/ports/UserPort';
import { User } from '../../domain/models/User';
import { UserStore } from '../UserStore';

@Injectable({ providedIn: 'root' })
export class ListUsersUseCase {
  constructor(
    @Inject(USER_PORT) private readonly userPort: UserPort,
    private readonly userStore: UserStore,
  ) {}

  execute(): Observable<User[]> {
    return this.userPort.list().pipe(tap((users) => this.userStore.setUsers(users)));
  }
}
