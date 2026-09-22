import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { AuthPort, Credentials } from '../../domain/ports/AuthPort';
import { AuthSession } from '../../domain/models/AuthSession';
import { LoginResponse } from '../../domain/models/LoginResponse';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

@Injectable({ providedIn: 'root' })
export class HttpAuthAdapter implements AuthPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  login(credentials: Credentials): Observable<AuthSession> {
    const body = { mail: credentials.username, key: credentials.password };

    return this.http.post<LoginResponse>(environment.loginUrl, body).pipe(
      tap((response) => this.tokenService.saveData(response)),
      map((response) => ({
        token: response.token,
        user: {
          idUser: String(response.user.idUser),
          name: response.user.mail,
          mail: response.user.mail,
        },
      })),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.status === 401
            ? 'Correo o contraseña incorrectos.'
            : 'No se pudo iniciar sesión. Intenta nuevamente.';
        return throwError(() => new Error(message));
      }),
    );
  }
}
