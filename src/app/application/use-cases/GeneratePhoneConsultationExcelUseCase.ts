import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Phone } from '../../domain/models/Phone';

export interface PhoneRow extends Phone {
  entity: string;
}

interface Column {
  header: string;
  width: number;
  getValue: (phone: PhoneRow) => string;
}

const COLUMNS: Column[] = [
  { header: 'N.° de Inventario', width: 18, getValue: (phone) => phone.inventoryNumber },
  { header: 'Marca', width: 16, getValue: (phone) => phone.brand },
  { header: 'Modelo', width: 20, getValue: (phone) => phone.model },
  { header: 'N.° de Serie', width: 18, getValue: (phone) => phone.serialNumber },
  { header: 'Entidad', width: 35, getValue: (phone) => phone.entity },
  { header: 'Dirección IP', width: 18, getValue: (phone) => phone.networkAddress },
  { header: 'Extensión', width: 12, getValue: (phone) => phone.extension },
  { header: 'Estado', width: 12, getValue: (phone) => (phone.active ? 'Activo' : 'Inactivo') },
];

@Injectable({ providedIn: 'root' })
export class GeneratePhoneConsultationExcelUseCase {
  execute(phones: PhoneRow[]): Uint8Array {
    const rows = phones.map((phone) =>
      Object.fromEntries(COLUMNS.map((column) => [column.header, column.getValue(phone)])),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((column) => column.header) });
    worksheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consulta de Teléfonos');

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(buffer);
  }
}
