import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AssetPort } from '../../domain/ports/AssetPort';
import { Asset, NewAsset } from '../../domain/models/Asset';
import { Floor } from '../../domain/models/SiteLocation';
import { formatLocationLabel } from '../../domain/models/SiteLocation';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface ResguardoDto {
  idResguardo: number;
  personal: { idPersonal: number; nombre: string; apellidos: string } | null;
  responsable: { idJefatura: number; name: string } | null;
  entidad: { idEntidad: number; nombre: string } | null;
  ubicacion: { idUbicacion: number; lugar: string; direccion: string; planta: string | null } | null;
  tipoEquipo: { idTipoEquipo: number; name: string } | null;
  consecutivo: string | null;
  fabricante: string | null;
  serie: string | null;
  inventario: string | null;
  modelo: string | null;
  sistemaOperativo: string | null;
  procesador: string | null;
  ram: string | null;
  tipoDisco: string | null;
  capacidadDisco: string | null;
  nucleosProcesador: string | null;
  direccionIp: string | null;
  direccionMac: string | null;
  direccionMacRed: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  active: boolean;
}

interface ResguardoPayload {
  personal: { idPersonal: number } | null;
  responsable: { idJefatura: number } | null;
  entidad: { idEntidad: number };
  ubicacion: { idUbicacion: number };
  tipoEquipo: { idTipoEquipo: number };
  consecutivo: string;
  fabricante: string;
  serie: string;
  inventario: string;
  modelo: string;
  sistemaOperativo: string;
  procesador: string;
  ram: string;
  tipoDisco: string;
  capacidadDisco: string;
  nucleosProcesador: string;
  direccionIp: string;
  direccionMac: string;
  direccionMacRed: string;
  active: boolean;
}

const PLANTA_TO_FLOOR: Record<string, Floor | undefined> = {
  PA: 'planta-alta',
  PB: 'planta-baja',
};

function toAsset(dto: ResguardoDto): Asset {
  const ubicacion = dto.ubicacion;
  const location = ubicacion
    ? formatLocationLabel({
        building: ubicacion.lugar,
        address: ubicacion.direccion,
        floor: ubicacion.planta ? PLANTA_TO_FLOOR[ubicacion.planta] : undefined,
      })
    : '';

  return {
    id: String(dto.idResguardo),
    name: dto.consecutivo ?? '',
    userId: dto.personal ? String(dto.personal.idPersonal) : '',
    user: dto.personal ? `${dto.personal.nombre} ${dto.personal.apellidos}` : '',
    custodianId: dto.responsable ? String(dto.responsable.idJefatura) : '',
    custodian: dto.responsable?.name ?? '',
    entityId: dto.entidad ? String(dto.entidad.idEntidad) : '',
    entity: dto.entidad?.nombre ?? '',
    manufacturer: dto.fabricante ?? '',
    serialNumber: dto.serie ?? '',
    inventoryNumber: dto.inventario ?? '',
    typeId: dto.tipoEquipo ? String(dto.tipoEquipo.idTipoEquipo) : '',
    type: dto.tipoEquipo?.name ?? '',
    model: dto.modelo ?? '',
    operatingSystem: dto.sistemaOperativo ?? '',
    locationId: ubicacion ? String(ubicacion.idUbicacion) : '',
    location,
    processor: dto.procesador ?? '',
    memoryRAM: dto.ram ?? '',
    hardDiskType: dto.tipoDisco ?? '',
    hardDiskCapacity: dto.capacidadDisco ?? '',
    processorNumber: dto.nucleosProcesador ?? '',
    networkAddress: dto.direccionIp ?? '',
    macAddress: dto.direccionMac ?? '',
    macAddressNetwork: dto.direccionMacRed ?? '',
    updatedAt: dto.updatedAt ?? dto.createdAt ?? '',
  };
}

function toResguardoPayload(input: NewAsset): ResguardoPayload {
  return {
    personal: input.userId ? { idPersonal: Number(input.userId) } : null,
    responsable: input.custodianId ? { idJefatura: Number(input.custodianId) } : null,
    entidad: { idEntidad: Number(input.entityId) },
    ubicacion: { idUbicacion: Number(input.locationId) },
    tipoEquipo: { idTipoEquipo: Number(input.typeId) },
    consecutivo: input.name,
    fabricante: input.manufacturer,
    serie: input.serialNumber,
    inventario: input.inventoryNumber,
    modelo: input.model,
    sistemaOperativo: input.operatingSystem,
    procesador: input.processor,
    ram: input.memoryRAM,
    tipoDisco: input.hardDiskType,
    capacidadDisco: input.hardDiskCapacity,
    nucleosProcesador: input.processorNumber,
    direccionIp: input.networkAddress,
    direccionMac: input.macAddress,
    direccionMacRed: input.macAddressNetwork,
    active: true,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpAssetAdapter implements AssetPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<Asset[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<ResguardoDto[] | null>(environment.resguardoFindAll, { headers })
      .pipe(map((dtos) => (dtos ?? []).filter((dto) => dto.active).map(toAsset)));
  }

  create(input: NewAsset): Observable<Asset> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .post<ResguardoDto>(environment.resguardoSave, toResguardoPayload(input), { headers })
      .pipe(map(toAsset));
  }

  update(id: string, changes: NewAsset): Observable<Asset> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .put<ResguardoDto>(`${environment.resguardoUpdate}/${id}`, toResguardoPayload(changes), { headers })
      .pipe(map(toAsset));
  }

  delete(id: string): Observable<void> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .delete<ResguardoDto>(`${environment.resguardoDeleteById}/${id}`, { headers })
      .pipe(map(() => undefined));
  }
}
