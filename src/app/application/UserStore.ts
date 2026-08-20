import { Injectable, computed, signal } from '@angular/core';
import { User } from '../domain/models/User';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly usersState = signal<User[]>([]);

  readonly users = this.usersState.asReadonly();

  readonly total = computed(() => this.usersState().length);
  readonly activeCount = computed(() => this.usersState().filter((u) => u.status === 'activo').length);
  readonly inactiveCount = computed(() => this.usersState().filter((u) => u.status === 'inactivo').length);

  setUsers(users: User[]): void {
    this.usersState.set(users);
  }

  addUser(user: User): void {
    this.usersState.update((users) => [user, ...users]);
  }

  updateUser(user: User): void {
    this.usersState.update((users) => users.map((existing) => (existing.id === user.id ? user : existing)));
  }
}
