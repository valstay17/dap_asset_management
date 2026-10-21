import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PHONE_PORT, PhonePort } from '../../domain/ports/PhonePort';
import { Phone, NewPhone } from '../../domain/models/Phone';
import { PhoneStore } from '../PhoneStore';

@Injectable({ providedIn: 'root' })
export class UpdatePhoneUseCase {
  constructor(
    @Inject(PHONE_PORT) private readonly phonePort: PhonePort,
    private readonly phoneStore: PhoneStore,
  ) {}

  execute(id: string, changes: NewPhone): Observable<Phone> {
    return this.phonePort.update(id, changes).pipe(tap((phone) => this.phoneStore.updatePhone(phone)));
  }
}
