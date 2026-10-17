import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MonitorPort } from '../../domain/ports/MonitorPort';
import { NewMonitor, Monitor } from '../../domain/models/Monitor';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface MonitorDto {
  idMonitor: number;
  inventario: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  entidad: { idEntidad: number } | null;
  direccionIp: string | null;
  active: boolean;
}

interface MonitorPayload {
  inventario: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  entidad: { idEntidad: number } | null;
  direccionIp: string | null;
  active: boolean;
}

function toMonitor(dto: MonitorDto): Monitor {
  return {
    id: String(dto.idMonitor),
    inventoryNumber: dto.inventario ?? '',
    brand: dto.marca ?? '',
    model: dto.modelo ?? '',
    serialNumber: dto.numeroSerie ?? '',
    entityId: dto.entidad ? String(dto.entidad.idEntidad) : '',
    networkAddress: dto.direccionIp ?? '',
    active: dto.active,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpMonitorAdapter implements MonitorPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  create(input: NewMonitor): Observable<Monitor> {
    const headers = this.tokenService.loggedHeader();
    const payload: MonitorPayload = {
      inventario: input.inventoryNumber,
      marca: input.brand,
      modelo: input.model,
      numeroSerie: input.serialNumber,
      entidad: input.entityId ? { idEntidad: Number(input.entityId) } : null,
      direccionIp: input.networkAddress || null,
      active: input.active,
    };

    return this.http.post<MonitorDto>(environment.monitorSave, payload, { headers }).pipe(map(toMonitor));
  }
}
