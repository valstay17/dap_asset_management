import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Asset } from '../../domain/models/Asset';
import { COLUMNS as CONSULTATION_COLUMNS, Column } from './GenerateAssetConsultationExcelUseCase';

function formatDate(value: string): string {
  const date = new Date(value);
  return value && !isNaN(date.getTime()) ? date.toLocaleDateString('es-MX') : '';
}

const COLUMNS: Column[] = [
  ...CONSULTATION_COLUMNS,
  { header: 'Fecha de Baja', width: 14, getValue: (asset) => formatDate(asset.updatedAt) },
];

@Injectable({ providedIn: 'root' })
export class GenerateRetiredAssetsExcelUseCase {
  execute(assets: Asset[]): Uint8Array {
    const rows = assets.map((asset) =>
      Object.fromEntries(COLUMNS.map((column) => [column.header, column.getValue(asset)])),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((column) => column.header) });
    worksheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bajas de Equipos');

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(buffer);
  }
}
