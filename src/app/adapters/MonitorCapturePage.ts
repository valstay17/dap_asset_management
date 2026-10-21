import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { CreateMonitorUseCase } from '../application/use-cases/CreateMonitorUseCase';
import { EntityStore } from '../application/EntityStore';

@Component({
  selector: 'app-monitor-capture-page',
  imports: [ReactiveFormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './MonitorCapturePage.html',
  styleUrl: './AssetCapturePage.css',
})
export class MonitorCapturePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly createMonitorUseCase = inject(CreateMonitorUseCase);
  private readonly entityStore = inject(EntityStore);

  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );

  readonly saving = signal(false);
  readonly infoMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    inventoryNumber: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    serialNumber: ['', Validators.required],
    entityId: ['', Validators.required],
    networkAddress: [''],
    active: [true],
  });

  ngOnInit(): void {
    this.listEntitiesUseCase.execute().subscribe();
  }

  isActive(): boolean {
    return this.form.controls.active.value;
  }

  toggleActive(): void {
    this.form.controls.active.setValue(!this.isActive());
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.infoMessage.set(null);
    this.errorMessage.set(null);
    this.saving.set(true);

    this.createMonitorUseCase.execute({ ...this.form.getRawValue(), userId: '' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.infoMessage.set('Monitor registrado correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo registrar el monitor. Intenta nuevamente.');
      },
    });
  }
}
