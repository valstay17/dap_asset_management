import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PhonePort } from '../../domain/ports/PhonePort';
import { NewPhone, Phone } from '../../domain/models/Phone';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface TelefonoDto {
  idTelefono: number;
  personal: { idPersonal: number } | null;
  inventario: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  entidad: { idEntidad: number } | null;
  direccionIp: string | null;
  extension: string | null;
  active: boolean;
}

interface TelefonoPayload {
  personal: { idPersonal: number } | null;
  inventario: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  entidad: { idEntidad: number } | null;
  direccionIp: string | null;
  extension: string | null;
  active: boolean;
}

function toPhone(dto: TelefonoDto): Phone {
  return {
    id: String(dto.idTelefono),
    userId: dto.personal ? String(dto.personal.idPersonal) : '',
    inventoryNumber: dto.inventario ?? '',
    brand: dto.marca ?? '',
    model: dto.modelo ?? '',
    serialNumber: dto.numeroSerie ?? '',
    entityId: dto.entidad ? String(dto.entidad.idEntidad) : '',
    networkAddress: dto.direccionIp ?? '',
    extension: dto.extension ?? '',
    active: dto.active,
  };
}

function toTelefonoPayload(input: NewPhone): TelefonoPayload {
  return {
    personal: input.userId ? { idPersonal: Number(input.userId) } : null,
    inventario: input.inventoryNumber,
    marca: input.brand,
    modelo: input.model,
    numeroSerie: input.serialNumber,
    entidad: input.entityId ? { idEntidad: Number(input.entityId) } : null,
    direccionIp: input.networkAddress || null,
    extension: input.extension || null,
    active: input.active,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpPhoneAdapter implements PhonePort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<Phone[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<TelefonoDto[] | null>(environment.telefonoFindAll, { headers })
      .pipe(map((dtos) => (dtos ?? []).map(toPhone)));
  }

  create(input: NewPhone): Observable<Phone> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .post<TelefonoDto>(environment.telefonoSave, toTelefonoPayload(input), { headers })
      .pipe(map(toPhone));
  }

  update(id: string, changes: NewPhone): Observable<Phone> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .put<TelefonoDto>(`${environment.telefonoUpdate}/${id}`, toTelefonoPayload(changes), { headers })
      .pipe(map(toPhone));
  }
}
