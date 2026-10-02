import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AreaManagerPort } from '../../domain/ports/AreaManagerPort';
import { AreaManager, NewAreaManager } from '../../domain/models/AreaManager';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface ResponsableDto {
  idJefatura: number;
  name: string;
  active: boolean;
  entidad: { idEntidad: number; nombre: string } | null;
}

interface ResponsablePayload {
  name: string;
  active: boolean;
  entidad: { idEntidad: number };
}

function toAreaManager(dto: ResponsableDto): AreaManager {
  return {
    id: String(dto.idJefatura),
    name: dto.name,
    entityId: dto.entidad ? String(dto.entidad.idEntidad) : '',
    entity: dto.entidad?.nombre ?? '',
    active: dto.active,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpAreaManagerAdapter implements AreaManagerPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<AreaManager[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<ResponsableDto[] | null>(environment.responsableFindAll, { headers })
      .pipe(map((dtos) => (dtos ?? []).map(toAreaManager)));
  }

  create(input: NewAreaManager): Observable<AreaManager> {
    const headers = this.tokenService.loggedHeader();
    const payload: ResponsablePayload = {
      name: input.name,
      active: true,
      entidad: { idEntidad: Number(input.entityId) },
    };

    return this.http
      .post<ResponsableDto>(environment.responsableSave, payload, { headers })
      .pipe(map(toAreaManager));
  }

  updateStatus(areaManager: AreaManager, active: boolean): Observable<AreaManager> {
    const headers = this.tokenService.loggedHeader();
    const payload: ResponsablePayload = {
      name: areaManager.name,
      active,
      entidad: { idEntidad: Number(areaManager.entityId) },
    };

    return this.http
      .put<ResponsableDto>(`${environment.responsableUpdate}/${areaManager.id}`, payload, { headers })
      .pipe(map(toAreaManager));
  }
}
