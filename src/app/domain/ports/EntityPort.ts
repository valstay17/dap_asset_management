import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Entity, NewEntity } from '../models/Entity';

export interface EntityPort {
  list(): Observable<Entity[]>;
  create(entity: NewEntity): Observable<Entity>;
}

export const ENTITY_PORT = new InjectionToken<EntityPort>('ENTITY_PORT');
