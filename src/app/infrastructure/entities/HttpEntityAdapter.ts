import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EntityPort } from '../../domain/ports/EntityPort';
import { Entity, NewEntity } from '../../domain/models/Entity';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface EntidadDto {
  idEntidad: number;
  nombre: string;
  comentarios: string | null;
  active: boolean;
  entidadPadre: { idEntidad: number } | null;
}

interface EntidadPayload {
  nombre: string;
  comentarios: string;
  active: boolean;
  entidadPadre: { idEntidad: number } | null;
}

function toEntity(dto: EntidadDto): Entity {
  return {
    id: String(dto.idEntidad),
    name: dto.nombre,
    level: 0,
    parentId: dto.entidadPadre ? String(dto.entidadPadre.idEntidad) : null,
    active: dto.active,
  };
}

function computeLevel(entity: Entity, byId: Map<string, Entity>): number {
  if (!entity.parentId) {
    return 0;
  }
  const parent = byId.get(entity.parentId);
  return parent ? computeLevel(parent, byId) + 1 : 0;
}

function withLevels(entities: Entity[]): Entity[] {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  return entities.map((entity) => ({ ...entity, level: computeLevel(entity, byId) }));
}

@Injectable({ providedIn: 'root' })
export class HttpEntityAdapter implements EntityPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<Entity[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<EntidadDto[] | null>(environment.entidadFindAll, { headers })
      .pipe(map((dtos) => withLevels((dtos ?? []).map(toEntity))));
  }

  create(input: NewEntity): Observable<Entity> {
    const headers = this.tokenService.loggedHeader();
    const payload: EntidadPayload = {
      nombre: input.name,
      comentarios: '',
      active: true,
      entidadPadre: input.parentId ? { idEntidad: Number(input.parentId) } : null,
    };

    return this.http
      .post<EntidadDto>(environment.entidadSave, payload, { headers })
      .pipe(map((dto) => ({ ...toEntity(dto), level: input.level })));
  }
}
