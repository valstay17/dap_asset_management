import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MonitorPort } from '../../domain/ports/MonitorPort';
import { NewMonitor, Monitor } from '../../domain/models/Monitor';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface MonitorDto {
  idMonitor: number;
  personal: { idPersonal: number } | null;
  inventario: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  entidad: { idEntidad: number } | null;
  direccionIp: string | null;
  active: boolean;
}

interface MonitorPayload {
  personal: { idPersonal: number } | null;
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
    userId: dto.personal ? String(dto.personal.idPersonal) : '',
    inventoryNumber: dto.inventario ?? '',
    brand: dto.marca ?? '',
    model: dto.modelo ?? '',
    serialNumber: dto.numeroSerie ?? '',
    entityId: dto.entidad ? String(dto.entidad.idEntidad) : '',
    networkAddress: dto.direccionIp ?? '',
    active: dto.active,
  };
}

function toMonitorPayload(input: NewMonitor): MonitorPayload {
  return {
    personal: input.userId ? { idPersonal: Number(input.userId) } : null,
    inventario: input.inventoryNumber,
    marca: input.brand,
    modelo: input.model,
    numeroSerie: input.serialNumber,
    entidad: input.entityId ? { idEntidad: Number(input.entityId) } : null,
    direccionIp: input.networkAddress || null,
    active: input.active,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpMonitorAdapter implements MonitorPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<Monitor[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<MonitorDto[] | null>(environment.monitorFindAll, { headers })
      .pipe(map((dtos) => (dtos ?? []).map(toMonitor)));
  }

  create(input: NewMonitor): Observable<Monitor> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .post<MonitorDto>(environment.monitorSave, toMonitorPayload(input), { headers })
      .pipe(map(toMonitor));
  }

  update(id: string, changes: NewMonitor): Observable<Monitor> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .put<MonitorDto>(`${environment.monitorUpdate}/${id}`, toMonitorPayload(changes), { headers })
      .pipe(map(toMonitor));
  }
}
