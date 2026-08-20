import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ENTITY_PORT, EntityPort } from '../../domain/ports/EntityPort';
import { Entity, NewEntity } from '../../domain/models/Entity';
import { EntityStore } from '../EntityStore';

@Injectable({ providedIn: 'root' })
export class CreateEntityUseCase {
  constructor(
    @Inject(ENTITY_PORT) private readonly entityPort: EntityPort,
    private readonly entityStore: EntityStore,
  ) {}

  execute(input: NewEntity): Observable<Entity> {
    return this.entityPort.create(input).pipe(tap((entity) => this.entityStore.addEntity(entity)));
  }
}
