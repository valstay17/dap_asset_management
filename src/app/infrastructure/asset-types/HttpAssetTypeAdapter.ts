import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AssetTypePort } from '../../domain/ports/AssetTypePort';
import { AssetType, NewAssetType } from '../../domain/models/AssetType';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface TipoEquipoDto {
  idTipoEquipo: number;
  name: string;
  active: boolean;
}

interface TipoEquipoPayload {
  name: string;
  active: boolean;
}

function toAssetType(dto: TipoEquipoDto): AssetType {
  return {
    id: String(dto.idTipoEquipo),
    name: dto.name,
    active: dto.active,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpAssetTypeAdapter implements AssetTypePort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<AssetType[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<TipoEquipoDto[] | null>(environment.tipoEquipoFindAll, { headers })
      .pipe(map((dtos) => (dtos ?? []).map(toAssetType)));
  }

  create(input: NewAssetType): Observable<AssetType> {
    const headers = this.tokenService.loggedHeader();
    const payload: TipoEquipoPayload = {
      name: input.name,
      active: true,
    };

    return this.http
      .post<TipoEquipoDto>(environment.tipoEquipoSave, payload, { headers })
      .pipe(map(toAssetType));
  }
}
