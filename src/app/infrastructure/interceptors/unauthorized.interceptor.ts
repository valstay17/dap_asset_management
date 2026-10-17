import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

// Cualquier 401 (token vencido o inválido) cierra la sesión, salvo en el login,
// donde un 401 significa credenciales incorrectas y el error lo maneja la pantalla.
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && req.url !== environment.loginUrl) {
        tokenService.logOut();
      }
      return throwError(() => error);
    }),
  );
};
