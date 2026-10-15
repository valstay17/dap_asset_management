import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
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
  private readonly entityStore = inject(EntityStore);

  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );

  readonly infoMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    inventoryNumber: ['', Validators.required],
    brand: ['', Validators.required],
    model: [''],
    serialNumber: [''],
    entityId: ['', Validators.required],
    networkAddress: [''],
  });

  ngOnInit(): void {
    this.listEntitiesUseCase.execute().subscribe();
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  // TODO: conectar con el backend cuando exista el endpoint de teléfonos.
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.infoMessage.set('El registro de teléfonos aún no está conectado al servidor; los datos no se guardaron.');
  }
}
