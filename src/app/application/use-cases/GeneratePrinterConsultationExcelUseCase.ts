import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Printer } from '../../domain/models/Printer';

export interface PrinterRow extends Printer {
  location: string;
}

interface Column {
  header: string;
  width: number;
  getValue: (printer: PrinterRow) => string;
}

const COLUMNS: Column[] = [
  { header: 'N.° de Inventario', width: 18, getValue: (printer) => printer.inventoryNumber },
  { header: 'Marca', width: 16, getValue: (printer) => printer.brand },
  { header: 'Tipo', width: 16, getValue: (printer) => printer.type },
  { header: 'N.° de Serie', width: 18, getValue: (printer) => printer.serialNumber },
  { header: 'Fabricante', width: 16, getValue: (printer) => printer.manufacturer },
  { header: 'Ubicación', width: 30, getValue: (printer) => printer.location },
  { header: 'Estado', width: 12, getValue: (printer) => (printer.active ? 'Activo' : 'Inactivo') },
];

@Injectable({ providedIn: 'root' })
export class GeneratePrinterConsultationExcelUseCase {
  execute(printers: PrinterRow[]): Uint8Array {
    const rows = printers.map((printer) =>
      Object.fromEntries(COLUMNS.map((column) => [column.header, column.getValue(printer)])),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((column) => column.header) });
    worksheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consulta de Impresoras');

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(buffer);
  }
}
