import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Asset } from '../../domain/models/Asset';

interface Column {
  header: string;
  width: number;
  getValue: (asset: Asset, buildingLabel: (location: string) => string) => string;
}

const COLUMNS: Column[] = [
  { header: "Dirección IP", width: 18, getValue: (asset) => asset.networkAddress },
  { header: 'Nombre del Equipo', width: 28, getValue: (asset) => asset.name },
  { header: 'Usuario', width: 28, getValue: (asset) => asset.user },
  { header: 'Entidad', width: 35, getValue: (asset) => asset.entity },
  { header: 'Ubicación', width: 30, getValue: (asset, buildingLabel) => buildingLabel(asset.location) },
];

@Injectable({ providedIn: 'root' })
export class GenerateIpListExcelUseCase {
  execute(assets: Asset[], buildingLabel: (location: string) => string): Uint8Array {
    const rows = assets.map((asset) =>
      Object.fromEntries(COLUMNS.map((column) => [column.header, column.getValue(asset, buildingLabel)])),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((column) => column.header) });
    worksheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de IP's");

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(buffer);
  }
}
