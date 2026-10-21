import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PRINTER_PORT, PrinterPort } from '../../domain/ports/PrinterPort';
import { Printer, NewPrinter } from '../../domain/models/Printer';
import { PrinterStore } from '../PrinterStore';

@Injectable({ providedIn: 'root' })
export class UpdatePrinterUseCase {
  constructor(
    @Inject(PRINTER_PORT) private readonly printerPort: PrinterPort,
    private readonly printerStore: PrinterStore,
  ) {}

  execute(id: string, changes: NewPrinter): Observable<Printer> {
    return this.printerPort.update(id, changes).pipe(tap((printer) => this.printerStore.updatePrinter(printer)));
  }
}
