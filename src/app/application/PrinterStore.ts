import { Injectable, signal } from '@angular/core';
import { Printer } from '../domain/models/Printer';

@Injectable({ providedIn: 'root' })
export class PrinterStore {
  private readonly printersState = signal<Printer[]>([]);

  readonly printers = this.printersState.asReadonly();

  setPrinters(printers: Printer[]): void {
    this.printersState.set(printers);
  }

  addPrinter(printer: Printer): void {
    this.printersState.update((printers) => [printer, ...printers]);
  }

  updatePrinter(printer: Printer): void {
    this.printersState.update((printers) =>
      printers.map((existing) => (existing.id === printer.id ? printer : existing)),
    );
  }
}
