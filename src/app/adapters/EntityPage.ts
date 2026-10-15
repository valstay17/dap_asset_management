import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
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
    ConfirmDialogModule,
    TooltipModule,
    NgStyle,
  ],
  providers: [ConfirmationService],
  templateUrl: './EntityPage.html',
  styleUrl: './EntityPage.css',
})
export class EntityPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly createEntityUseCase = inject(CreateEntityUseCase);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly entityStore = inject(EntityStore);

  readonly entities = this.entityStore.entities;
  readonly root = this.entityStore.root;

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingEntity = signal<Entity | null>(null);

  // Las entidades dadas de baja se conservan en el store pero no se listan.
  private readonly activeEntities = computed(() => this.entities().filter((entity) => entity.active));

  // La raíz no puede cambiar de padre; tampoco se pide padre si aún no existe raíz.
  readonly showParentField = computed(() => {
    const editing = this.editingEntity();
    return editing ? !!editing.parentId : !!this.root();
  });

  readonly treeNodes = computed<TreeNode<Entity>[]>(() => {
    const nodeById = new Map<string, TreeNode<Entity>>();
    for (const entity of this.activeEntities()) {
      nodeById.set(entity.id, { data: entity, children: [], expanded: true });
    }

    const roots: TreeNode<Entity>[] = [];
    for (const entity of this.activeEntities()) {
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

  // Cualquier entidad activa existente puede ser el padre; el nivel se deriva de ella.
  // Al editar se excluyen la propia entidad y sus descendientes para no generar ciclos.
  readonly parentOptions = computed(() => {
    const editing = this.editingEntity();
    const excluded = editing ? this.descendantIds(editing.id) : new Set<string>();
    return this.activeEntities()
      .filter((entity) => !excluded.has(entity.id))
      .map((entity) => ({
        id: entity.id,
        label: `${'—  '.repeat(entity.level)}${entity.name}`,
      }));
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    parentId: [''],
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
    this.editingEntity.set(null);
    this.form.reset({ name: '', parentId: this.root()?.id ?? '' });
    this.showCreateDialog.set(true);
  }

  openEditDialog(entity: Entity): void {
    this.errorMessage.set(null);
    this.editingEntity.set(entity);
    this.form.reset({ name: entity.name, parentId: entity.parentId ?? '' });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  confirmDelete(entity: Entity): void {
    const hasChildren = this.activeEntities().some((child) => child.parentId === entity.id);
    if (hasChildren) {
      this.confirmationService.confirm({
        header: 'No se puede eliminar',
        message: `La entidad "${entity.name}" tiene entidades dependientes. Elimínalas o muévelas a otra entidad primero.`,
        icon: 'pi pi-info-circle',
        acceptLabel: 'Entendido',
        rejectVisible: false,
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Eliminar entidad',
      message: `¿Deseas eliminar la entidad "${entity.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.deleteEntity(entity),
    });
  }

  // TODO: conectar con el endpoint de eliminación cuando esté disponible; por ahora solo afecta la vista.
  private deleteEntity(entity: Entity): void {
    this.entityStore.deactivateEntity(entity.id);
  }

  private descendantIds(id: string): Set<string> {
    const ids = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      for (const entity of this.entities()) {
        if (entity.parentId && ids.has(entity.parentId) && !ids.has(entity.id)) {
          ids.add(entity.id);
          added = true;
        }
      }
    }
    return ids;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, parentId } = this.form.getRawValue();
    const editing = this.editingEntity();
    const parent = parentId ? this.entities().find((entity) => entity.id === parentId) : undefined;

    if (this.showParentField() && !parent) {
      this.errorMessage.set('Selecciona la entidad padre.');
      return;
    }

    const payload: NewEntity = parent
      ? { name, parentId: parent.id, level: parent.level + 1 }
      : { name, parentId: null, level: 0 };

    // TODO: conectar con el endpoint de actualización cuando esté disponible; por ahora solo afecta la vista.
    if (editing) {
      this.entityStore.updateEntity({ ...editing, ...payload });
      this.closeAndResetForm();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.createEntityUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAndResetForm();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar la entidad. Intenta nuevamente.');
      },
    });
  }

  private closeAndResetForm(): void {
    this.showCreateDialog.set(false);
    this.editingEntity.set(null);
    this.form.reset({ name: '', parentId: this.root()?.id ?? '' });
  }
}
