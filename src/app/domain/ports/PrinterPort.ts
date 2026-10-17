import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Printer, NewPrinter } from '../models/Printer';

export interface PrinterPort {
  create(input: NewPrinter): Observable<Printer>;
}

export const PRINTER_PORT = new InjectionToken<PrinterPort>('PRINTER_PORT');
