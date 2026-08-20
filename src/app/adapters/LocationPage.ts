import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { CreateLocationUseCase } from '../application/use-cases/CreateLocationUseCase';
import { LocationStore } from '../application/LocationStore';
import { Floor, NewSiteLocation } from '../domain/models/SiteLocation';

const FLOOR_OPTIONS: { label: string; value: Floor }[] = [
  { label: 'Planta alta', value: 'planta-alta' },
  { label: 'Planta baja', value: 'planta-baja' },
];

const FLOOR_LABELS: Record<Floor, string> = {
  'planta-alta': 'Planta alta',
  'planta-baja': 'Planta baja',
};

@Component({
  selector: 'app-location-page',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    Select,
    Checkbox,
    MessageModule,
  ],
  templateUrl: './LocationPage.html',
  styleUrl: './LocationPage.css',
})
export class LocationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly createLocationUseCase = inject(CreateLocationUseCase);
  private readonly locationStore = inject(LocationStore);

  readonly floorOptions = FLOOR_OPTIONS;

  readonly locations = this.locationStore.locations;

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    building: ['', Validators.required],
    address: ['', Validators.required],
    hasMultipleFloors: [false],
    floor: this.fb.control<Floor | null>(null),
  });

  ngOnInit(): void {
    this.listLocationsUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  floorLabel(floor?: Floor): string {
    return floor ? FLOOR_LABELS[floor] : '—';
  }

  hasMultipleFloors(): boolean {
    return this.form.controls.hasMultipleFloors.value;
  }

  isInvalid(controlName: 'building' | 'address'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  openCreateDialog(): void {
    this.errorMessage.set(null);
    this.form.reset({ building: '', address: '', hasMultipleFloors: false, floor: null });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  onSubmit(): void {
    const { building, address, hasMultipleFloors, floor } = this.form.getRawValue();

    if (this.form.controls.building.invalid || this.form.controls.address.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    if (hasMultipleFloors && !floor) {
      this.errorMessage.set('Selecciona en cuál planta está.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload: NewSiteLocation = { building, address, floor: hasMultipleFloors ? floor! : undefined };

    this.createLocationUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateDialog.set(false);
        this.form.reset({ building: '', address: '', hasMultipleFloors: false, floor: null });
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar la ubicación. Intenta nuevamente.');
      },
    });
  }
}
