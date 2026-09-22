import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LocationPort } from '../../domain/ports/LocationPort';
import { Floor, NewSiteLocation, SiteLocation } from '../../domain/models/SiteLocation';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface UbicacionDto {
  idUbicacion: number;
  lugar: string;
  direccion: string;
  adicionales: string;
  planta: string;
  active: boolean;
}

const FLOOR_TO_PLANTA: Record<Floor, string> = {
  'planta-alta': 'PA',
  'planta-baja': 'PB',
};

const PLANTA_TO_FLOOR: Record<string, Floor | undefined> = {
  PA: 'planta-alta',
  PB: 'planta-baja',
};

function toSiteLocation(dto: UbicacionDto): SiteLocation {
  return {
    id: String(dto.idUbicacion),
    building: dto.lugar,
    address: dto.direccion,
    floor: PLANTA_TO_FLOOR[dto.planta],
  };
}

function toUbicacionPayload(input: NewSiteLocation): Omit<UbicacionDto, 'idUbicacion'> {
  return {
    lugar: input.building,
    direccion: input.address,
    adicionales: '',
    planta: input.floor ? FLOOR_TO_PLANTA[input.floor] : '',
    active: true,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpLocationAdapter implements LocationPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);


  list(): Observable<SiteLocation[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<UbicacionDto[]>(environment.ubicacionFindAll, {headers: headers})
      .pipe(map((dtos) => dtos.map(toSiteLocation)));
  }

  create(input: NewSiteLocation): Observable<SiteLocation> {
    return this.http
      .post<UbicacionDto>(environment.ubicacionSave, toUbicacionPayload(input))
      .pipe(map(toSiteLocation));
  }
}
