import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Monitor } from '../../domain/models/Monitor';

export interface MonitorRow extends Monitor {
  entity: string;
}

interface Column {
  header: string;
  width: number;
  getValue: (monitor: MonitorRow) => string;
}

const COLUMNS: Column[] = [
  { header: 'N.° de Inventario', width: 18, getValue: (monitor) => monitor.inventoryNumber },
  { header: 'Marca', width: 16, getValue: (monitor) => monitor.brand },
  { header: 'Modelo', width: 20, getValue: (monitor) => monitor.model },
  { header: 'N.° de Serie', width: 18, getValue: (monitor) => monitor.serialNumber },
  { header: 'Entidad', width: 35, getValue: (monitor) => monitor.entity },
  { header: 'Dirección IP', width: 18, getValue: (monitor) => monitor.networkAddress },
  { header: 'Estado', width: 12, getValue: (monitor) => (monitor.active ? 'Activo' : 'Inactivo') },
];

@Injectable({ providedIn: 'root' })
export class GenerateMonitorConsultationExcelUseCase {
  execute(monitors: MonitorRow[]): Uint8Array {
    const rows = monitors.map((monitor) =>
      Object.fromEntries(COLUMNS.map((column) => [column.header, column.getValue(monitor)])),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((column) => column.header) });
    worksheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consulta de Monitores');

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(buffer);
  }
}
