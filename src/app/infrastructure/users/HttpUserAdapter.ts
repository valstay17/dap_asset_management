import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserPort } from '../../domain/ports/UserPort';
import { NewUser, User, UserStatus } from '../../domain/models/User';
import { formatLocationLabel } from '../../domain/models/SiteLocation';
import { environment } from '../../environment';
import { TokenService } from '../../tokenService';

interface PersonalDto {
  idPersonal: number;
  nombre: string;
  apellidos: string;
  active: boolean;
  ubicacion: { idUbicacion: number; lugar: string; direccion: string; planta: string | null } | null;
  entidad: { idEntidad: number; nombre: string } | null;
}

interface PersonalPayload {
  nombre: string;
  apellidos: string;
  active: boolean;
  ubicacion: { idUbicacion: number };
  entidad: { idEntidad: number };
}

const PLANTA_TO_FLOOR: Record<string, 'planta-alta' | 'planta-baja' | undefined> = {
  PA: 'planta-alta',
  PB: 'planta-baja',
};

function toUser(dto: PersonalDto): User {
  const ubicacion = dto.ubicacion;
  const locationLabel = ubicacion
    ? formatLocationLabel({
        building: ubicacion.lugar,
        address: ubicacion.direccion,
        floor: ubicacion.planta ? PLANTA_TO_FLOOR[ubicacion.planta] : undefined,
      })
    : '';

  return {
    id: String(dto.idPersonal),
    firstName: dto.nombre,
    lastName: dto.apellidos,
    entityId: dto.entidad ? String(dto.entidad.idEntidad) : '',
    entity: dto.entidad?.nombre ?? '',
    locationId: ubicacion ? String(ubicacion.idUbicacion) : '',
    location: locationLabel,
    status: dto.active ? 'activo' : 'inactivo',
  };
}

@Injectable({ providedIn: 'root' })
export class HttpUserAdapter implements UserPort {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  list(): Observable<User[]> {
    const headers = this.tokenService.loggedHeader();
    return this.http
      .get<PersonalDto[] | null>(environment.personalFindAll, { headers })
      .pipe(map((dtos) => (dtos ?? []).map(toUser)));
  }

  create(input: NewUser): Observable<User> {
    const headers = this.tokenService.loggedHeader();
    const payload: PersonalPayload = {
      nombre: input.firstName,
      apellidos: input.lastName,
      active: true,
      ubicacion: { idUbicacion: Number(input.locationId) },
      entidad: { idEntidad: Number(input.entityId) },
    };

    return this.http
      .post<PersonalDto>(environment.personalSave, payload, { headers })
      .pipe(map(toUser));
  }

  updateStatus(user: User, status: UserStatus): Observable<User> {
    const headers = this.tokenService.loggedHeader();
    const payload: PersonalPayload = {
      nombre: user.firstName,
      apellidos: user.lastName,
      active: status === 'activo',
      ubicacion: { idUbicacion: Number(user.locationId) },
      entidad: { idEntidad: Number(user.entityId) },
    };

    return this.http
      .put<PersonalDto>(`${environment.personalUpdate}/${user.id}`, payload, { headers })
      .pipe(map(toUser));
  }
}
