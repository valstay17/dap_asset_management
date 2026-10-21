import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PRINTER_PORT, PrinterPort } from '../../domain/ports/PrinterPort';
import { Printer } from '../../domain/models/Printer';
import { PrinterStore } from '../PrinterStore';

@Injectable({ providedIn: 'root' })
export class ListPrintersUseCase {
  constructor(
    @Inject(PRINTER_PORT) private readonly printerPort: PrinterPort,
    private readonly printerStore: PrinterStore,
  ) {}

  execute(): Observable<Printer[]> {
    return this.printerPort.list().pipe(tap((printers) => this.printerStore.setPrinters(printers)));
  }
}
