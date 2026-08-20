import { Injectable, signal} from '@angular/core';
import { AuthSession } from './../domain/models/AuthSession';

const SESSION_STORAGE_KEY = 'dap-session';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly sessionState = signal<AuthSession | null>(this.readInitialSession());

  readonly session = this.sessionState.asReadonly();

  setSession(session: AuthSession): void {
    this.sessionState.set(session);
    this.persistSession(session);
  }

  clearSession(): void {
    this.sessionState.set(null);
    this.removePersistedSession();
  }

  private readInitialSession(): AuthSession | null {
    if (typeof globalThis.localStorage === 'undefined') {
      return null;
    }

    const raw = globalThis.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  private persistSession(session: AuthSession): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  private removePersistedSession(): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    globalThis.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

