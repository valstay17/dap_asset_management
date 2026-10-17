import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { CreatePhoneUseCase } from '../application/use-cases/CreatePhoneUseCase';
import { EntityStore } from '../application/EntityStore';

@Component({
  selector: 'app-phone-capture-page',
  imports: [ReactiveFormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './PhoneCapturePage.html',
  styleUrl: './AssetCapturePage.css',
})
export class PhoneCapturePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly createPhoneUseCase = inject(CreatePhoneUseCase);
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
    extension: [''],
  });

  ngOnInit(): void {
    this.listEntitiesUseCase.execute().subscribe();
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

    this.createPhoneUseCase.execute({ ...this.form.getRawValue(), active: true }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.infoMessage.set('Teléfono registrado correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo registrar el teléfono. Intenta nuevamente.');
      },
    });
  }
}
