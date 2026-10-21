import { Injectable, signal } from '@angular/core';
import { Phone } from '../domain/models/Phone';

@Injectable({ providedIn: 'root' })
export class PhoneStore {
  private readonly phonesState = signal<Phone[]>([]);

  readonly phones = this.phonesState.asReadonly();

  setPhones(phones: Phone[]): void {
    this.phonesState.set(phones);
  }

  addPhone(phone: Phone): void {
    this.phonesState.update((phones) => [phone, ...phones]);
  }

  updatePhone(phone: Phone): void {
    this.phonesState.update((phones) =>
      phones.map((existing) => (existing.id === phone.id ? phone : existing)),
    );
  }
}
