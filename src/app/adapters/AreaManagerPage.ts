import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListAreaManagersUseCase } from '../application/use-cases/ListAreaManagersUseCase';
import { CreateAreaManagerUseCase } from '../application/use-cases/CreateAreaManagerUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { AreaManagerStore } from '../application/AreaManagerStore';
import { EntityStore } from '../application/EntityStore';
import { NewAreaManager } from '../domain/models/AreaManager';

@Component({
  selector: 'app-area-manager-page',
  imports: [ReactiveFormsModule, ButtonModule, TableModule, DialogModule, InputTextModule, Select, MessageModule],
  templateUrl: './AreaManagerPage.html',
  styleUrl: './AreaManagerPage.css',
})
export class AreaManagerPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listAreaManagersUseCase = inject(ListAreaManagersUseCase);
  private readonly createAreaManagerUseCase = inject(CreateAreaManagerUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly areaManagerStore = inject(AreaManagerStore);
  private readonly entityStore = inject(EntityStore);

  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0)
      .map((entity) => entity.name),
  );

  readonly areaManagers = this.areaManagerStore.areaManagers;
  readonly total = this.areaManagerStore.total;

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    entity: ['', Validators.required],
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.listAreaManagersUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listEntitiesUseCase.execute().subscribe();
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  openCreateDialog(): void {
    this.errorMessage.set(null);
    this.form.reset();
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

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.createAreaManagerUseCase.execute(this.form.getRawValue() as NewAreaManager).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateDialog.set(false);
        this.form.reset();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar el jefe de área. Intenta nuevamente.');
      },
    });
  }
}
