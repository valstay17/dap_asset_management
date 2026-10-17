import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRINTER_PORT, PrinterPort } from '../../domain/ports/PrinterPort';
import { Printer, NewPrinter } from '../../domain/models/Printer';

@Injectable({ providedIn: 'root' })
export class CreatePrinterUseCase {
  constructor(@Inject(PRINTER_PORT) private readonly printerPort: PrinterPort) {}

  execute(input: NewPrinter): Observable<Printer> {
    return this.printerPort.create(input);
  }
}
