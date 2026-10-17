import { Injectable, computed, signal } from '@angular/core';
import { Entity } from '../domain/models/Entity';

function withLevels(entities: Entity[]): Entity[] {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const levelOf = (entity: Entity, visited = new Set<string>()): number => {
    const parent = entity.parentId ? byId.get(entity.parentId) : undefined;
    if (!parent || visited.has(entity.id)) {
      return 0;
    }
    visited.add(entity.id);
    return levelOf(parent, visited) + 1;
  };
  return entities.map((entity) => ({ ...entity, level: levelOf(entity) }));
}

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

  // Al cambiar de padre cambian los niveles de la entidad y sus descendientes.
  updateEntity(entity: Entity): void {
    this.entitiesState.update((entities) =>
      withLevels(entities.map((existing) => (existing.id === entity.id ? entity : existing))),
    );
  }

  // Baja lógica: se conserva para resolver nombres en registros existentes.
  deactivateEntity(id: string): void {
    this.entitiesState.update((entities) =>
      entities.map((existing) => (existing.id === id ? { ...existing, active: false } : existing)),
    );
  }
}
