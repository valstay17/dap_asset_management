import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Asset } from '../../domain/models/Asset';

interface Column {
  header: string;
  width: number;
  getValue: (asset: Asset) => string;
}

const COLUMNS: Column[] = [
  { header: 'Nombre', width: 16, getValue: (asset) => asset.name },
  { header: 'Usuario', width: 28, getValue: (asset) => asset.user || 'Sin asignar' },
  { header: 'Resguardante', width: 28, getValue: (asset) => asset.custodian || 'Sin asignar' },
  { header: 'Entidad', width: 35, getValue: (asset) => asset.entity },
  { header: 'Ubicación', width: 30, getValue: (asset) => asset.location },
  { header: 'Tipo', width: 16, getValue: (asset) => asset.type },
  { header: 'Fabricante', width: 16, getValue: (asset) => asset.manufacturer },
  { header: 'Modelo', width: 20, getValue: (asset) => asset.model },
  { header: 'N.° de Serie', width: 18, getValue: (asset) => asset.serialNumber },
  { header: 'N.° de Inventario', width: 18, getValue: (asset) => asset.inventoryNumber },
  { header: 'Sistema Operativo', width: 22, getValue: (asset) => asset.operatingSystem },
  { header: 'Procesador', width: 24, getValue: (asset) => asset.processor },
  { header: 'Núcleos del Procesador', width: 14, getValue: (asset) => asset.processorNumber },
  { header: 'Memoria RAM', width: 14, getValue: (asset) => asset.memoryRAM },
  { header: 'Disco Duro - Tipo', width: 16, getValue: (asset) => asset.hardDiskType },
  { header: 'Disco Duro - Capacidad', width: 18, getValue: (asset) => asset.hardDiskCapacity },
  { header: 'Dirección IP', width: 18, getValue: (asset) => asset.networkAddress },
  { header: 'Dirección MAC', width: 20, getValue: (asset) => asset.macAddress },
  { header: 'Dirección MAC (Red)', width: 20, getValue: (asset) => asset.macAddressNetwork },
];

@Injectable({ providedIn: 'root' })
export class GenerateAssetConsultationExcelUseCase {
  execute(assets: Asset[]): Uint8Array {
    const rows = assets.map((asset) =>
      Object.fromEntries(COLUMNS.map((column) => [column.header, column.getValue(asset)])),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((column) => column.header) });
    worksheet['!cols'] = COLUMNS.map((column) => ({ wch: column.width }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consulta de Equipos');

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Uint8Array(buffer);
  }
}
