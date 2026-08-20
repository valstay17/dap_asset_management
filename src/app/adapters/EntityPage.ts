import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { CreateEntityUseCase } from '../application/use-cases/CreateEntityUseCase';
import { EntityStore } from '../application/EntityStore';
import { Entity, NewEntity } from '../domain/models/Entity';

@Component({
  selector: 'app-entity-page',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TreeTableModule,
    DialogModule,
    InputTextModule,
    Select,
    MessageModule,
    NgStyle,
  ],
  templateUrl: './EntityPage.html',
  styleUrl: './EntityPage.css',
})
export class EntityPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly createEntityUseCase = inject(CreateEntityUseCase);
  private readonly entityStore = inject(EntityStore);

  readonly entities = this.entityStore.entities;
  readonly root = this.entityStore.root;

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly treeNodes = computed<TreeNode<Entity>[]>(() => {
    const nodeById = new Map<string, TreeNode<Entity>>();
    for (const entity of this.entities()) {
      nodeById.set(entity.id, { data: entity, children: [], expanded: true });
    }

    const roots: TreeNode<Entity>[] = [];
    for (const entity of this.entities()) {
      const node = nodeById.get(entity.id)!;
      const parent = entity.parentId ? nodeById.get(entity.parentId) : undefined;
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  });

  // Cualquier entidad existente puede ser el padre de una nueva; el nivel se deriva de ella.
  readonly parentOptions = computed(() =>
    this.entities().map((entity) => ({
      id: entity.id,
      label: `${'—  '.repeat(entity.level)}${entity.name}`,
    })),
  );

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    parentId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.listEntitiesUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  isInvalid(controlName: 'name' | 'parentId'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  nameCellStyle(level: number): Record<string, string> {
    return {
      'padding-left': `${level * 24}px`,
      'font-weight': `${Math.max(700 - level * 100, 400)}`,
      opacity: `${Math.max(1 - level * 0.12, 0.55)}`,
    };
  }

  openCreateDialog(): void {
    this.errorMessage.set(null);
    this.form.reset({ name: '', parentId: this.root()?.id ?? '' });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, parentId } = this.form.getRawValue();
    const parent = this.entities().find((entity) => entity.id === parentId);
    if (!parent) {
      this.errorMessage.set('Selecciona la entidad padre.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload: NewEntity = { name, parentId, level: parent.level + 1 };

    this.createEntityUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateDialog.set(false);
        this.form.reset({ name: '', parentId: this.root()?.id ?? '' });
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar la entidad. Intenta nuevamente.');
      },
    });
  }
}
