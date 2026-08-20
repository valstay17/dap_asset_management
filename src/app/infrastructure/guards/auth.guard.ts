import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionStore } from '../../application/SessionStore';

export const authGuard: CanActivateFn = () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  if (sessionStore.session()) {
    return true;
  }

  return router.parseUrl('/login');
};

