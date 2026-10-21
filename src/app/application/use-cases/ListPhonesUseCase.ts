import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PHONE_PORT, PhonePort } from '../../domain/ports/PhonePort';
import { Phone } from '../../domain/models/Phone';
import { PhoneStore } from '../PhoneStore';

@Injectable({ providedIn: 'root' })
export class ListPhonesUseCase {
  constructor(
    @Inject(PHONE_PORT) private readonly phonePort: PhonePort,
    private readonly phoneStore: PhoneStore,
  ) {}

  execute(): Observable<Phone[]> {
    return this.phonePort.list().pipe(tap((phones) => this.phoneStore.setPhones(phones)));
  }
}
