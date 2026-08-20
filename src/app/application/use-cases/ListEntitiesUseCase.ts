import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ENTITY_PORT, EntityPort } from '../../domain/ports/EntityPort';
import { Entity } from '../../domain/models/Entity';
import { EntityStore } from '../EntityStore';

@Injectable({ providedIn: 'root' })
export class ListEntitiesUseCase {
  constructor(
    @Inject(ENTITY_PORT) private readonly entityPort: EntityPort,
    private readonly entityStore: EntityStore,
  ) {}

  execute(): Observable<Entity[]> {
    return this.entityPort.list().pipe(tap((entities) => this.entityStore.setEntities(entities)));
  }
}
