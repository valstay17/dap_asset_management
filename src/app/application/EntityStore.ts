import { Injectable, computed, signal } from '@angular/core';
import { Entity } from '../domain/models/Entity';

@Injectable({ providedIn: 'root' })
export class EntityStore {
  private readonly entitiesState = signal<Entity[]>([]);

  readonly entities = this.entitiesState.asReadonly();

  readonly root = computed(() => this.entitiesState().find((entity) => entity.level === 0) ?? null);

  setEntities(entities: Entity[]): void {
    this.entitiesState.set(entities);
  }

  addEntity(entity: Entity): void {
    this.entitiesState.update((entities) => [...entities, entity]);
  }
}
