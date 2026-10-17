import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PHONE_PORT, PhonePort } from '../../domain/ports/PhonePort';
import { Phone, NewPhone } from '../../domain/models/Phone';

@Injectable({ providedIn: 'root' })
export class CreatePhoneUseCase {
  constructor(@Inject(PHONE_PORT) private readonly phonePort: PhonePort) {}

  execute(input: NewPhone): Observable<Phone> {
    return this.phonePort.create(input);
  }
}
