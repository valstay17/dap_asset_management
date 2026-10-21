import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Phone, NewPhone } from '../models/Phone';

export interface PhonePort {
  list(): Observable<Phone[]>;
  create(input: NewPhone): Observable<Phone>;
  update(id: string, changes: NewPhone): Observable<Phone>;
}

export const PHONE_PORT = new InjectionToken<PhonePort>('PHONE_PORT');
