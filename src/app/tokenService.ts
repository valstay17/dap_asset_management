import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {LoginResponse} from './domain/models/LoginResponse'
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private token: string = '';

  constructor(@Inject(PLATFORM_ID)
              private readonly platformId: Object,
              private readonly router: Router,
  ) {}

  public saveData(data: LoginResponse): void {
    sessionStorage.setItem('data', JSON.stringify(data));
  }

  public getToken(): string {
    const userData = JSON.parse(sessionStorage.getItem('data') || 'null');
    
    if (!userData || !userData.token) {
      throw new Error('User not authenticated');
    }
    return userData.token;
  }

  public loggedHeader() : HttpHeaders{
    return new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
  }

  public logOut(): void {
    sessionStorage.removeItem('data');
    this.router.navigate(['/login']);
  }
}
