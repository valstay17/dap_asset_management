import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { CreatePrinterUseCase } from '../application/use-cases/CreatePrinterUseCase';
import { LocationStore } from '../application/LocationStore';
import { formatLocationLabel } from '../domain/models/SiteLocation';

@Component({
  selector: 'app-printer-capture-page',
  imports: [ReactiveFormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './PrinterCapturePage.html',
  styleUrl: './AssetCapturePage.css',
})
export class PrinterCapturePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly createPrinterUseCase = inject(CreatePrinterUseCase);
  private readonly locationStore = inject(LocationStore);

  readonly locationOptions = computed(() =>
    this.locationStore
      .locations()
      .filter((location) => location.active)
      .map((location) => ({ id: location.id, label: formatLocationLabel(location) })),
  );

  readonly saving = signal(false);
  readonly infoMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    inventoryNumber: ['', Validators.required],
    brand: ['', Validators.required],
    type: ['', Validators.required],
    serialNumber: ['', Validators.required],
    locationId: ['', Validators.required],
    manufacturer: ['', Validators.required],
    active: [true],
  });

  ngOnInit(): void {
    this.listLocationsUseCase.execute().subscribe();
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

    this.createPrinterUseCase.execute({ ...this.form.getRawValue(), userId: '' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ active: true });
        this.infoMessage.set('Impresora registrada correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudo registrar la impresora. Intenta nuevamente.');
      },
    });
  }
}
