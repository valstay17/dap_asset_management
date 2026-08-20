import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { USER_PORT, UserPort } from '../../domain/ports/UserPort';
import { User } from '../../domain/models/User';
import { UserStore } from '../UserStore';

@Injectable({ providedIn: 'root' })
export class ToggleUserStatusUseCase {
  constructor(
    @Inject(USER_PORT) private readonly userPort: UserPort,
    private readonly userStore: UserStore,
  ) {}

  execute(user: User): Observable<User> {
    const nextStatus = user.status === 'activo' ? 'inactivo' : 'activo';
    return this.userPort.updateStatus(user.id, nextStatus).pipe(tap((updated) => this.userStore.updateUser(updated)));
  }
}
