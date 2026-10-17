import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PhonePort } from '../../domain/ports/PhonePort';
import { NewPhone, Phone } from '../../domain/models/Phone';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface TelefonoDto {
  idTelefono: number;
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

@Injectable({ providedIn: 'root' })
export class HttpPhoneAdapter implements PhonePort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  create(input: NewPhone): Observable<Phone> {
    const headers = this.tokenService.loggedHeader();
    const payload: TelefonoPayload = {
      inventario: input.inventoryNumber,
      marca: input.brand,
      modelo: input.model,
      numeroSerie: input.serialNumber,
      entidad: input.entityId ? { idEntidad: Number(input.entityId) } : null,
      direccionIp: input.networkAddress || null,
      extension: input.extension || null,
      active: input.active,
    };

    return this.http.post<TelefonoDto>(environment.telefonoSave, payload, { headers }).pipe(map(toPhone));
  }
}
