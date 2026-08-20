import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { USER_PORT, UserPort } from '../../domain/ports/UserPort';
import { NewUser, User } from '../../domain/models/User';
import { UserStore } from '../UserStore';

@Injectable({ providedIn: 'root' })
export class CreateUserUseCase {
  constructor(
    @Inject(USER_PORT) private readonly userPort: UserPort,
    private readonly userStore: UserStore,
  ) {}

  execute(input: NewUser): Observable<User> {
    return this.userPort.create(input).pipe(tap((user) => this.userStore.addUser(user)));
  }
}
