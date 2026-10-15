import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { CreateLocationUseCase } from '../application/use-cases/CreateLocationUseCase';
import { LocationStore } from '../application/LocationStore';
import { Floor, NewSiteLocation, SiteLocation } from '../domain/models/SiteLocation';

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
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './LocationPage.html',
  styleUrl: './LocationPage.css',
})
export class LocationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly createLocationUseCase = inject(CreateLocationUseCase);
  private readonly locationStore = inject(LocationStore);
  private readonly confirmationService = inject(ConfirmationService);

  readonly floorOptions = FLOOR_OPTIONS;

  // Las ubicaciones dadas de baja se conservan en el store pero no se listan.
  readonly locations = computed(() => this.locationStore.locations().filter((location) => location.active));

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingLocation = signal<SiteLocation | null>(null);

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
    this.editingLocation.set(null);
    this.form.reset({ building: '', address: '', hasMultipleFloors: false, floor: null });
    this.showCreateDialog.set(true);
  }

  openEditDialog(location: SiteLocation): void {
    this.errorMessage.set(null);
    this.editingLocation.set(location);
    this.form.reset({
      building: location.building,
      address: location.address,
      hasMultipleFloors: !!location.floor,
      floor: location.floor ?? null,
    });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  confirmDelete(location: SiteLocation): void {
    this.confirmationService.confirm({
      header: 'Eliminar ubicación',
      message: `¿Deseas eliminar la ubicación "${location.building}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      // TODO: conectar con el endpoint de eliminación cuando esté disponible; por ahora solo afecta la vista.
      accept: () => this.locationStore.deactivateLocation(location.id),
    });
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

    const payload: NewSiteLocation = { building, address, floor: hasMultipleFloors ? floor! : undefined };

    // TODO: conectar con el endpoint de actualización cuando esté disponible; por ahora solo afecta la vista.
    const editing = this.editingLocation();
    if (editing) {
      this.locationStore.updateLocation({ ...editing, ...payload });
      this.closeAndResetForm();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.createLocationUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAndResetForm();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar la ubicación. Intenta nuevamente.');
      },
    });
  }

  private closeAndResetForm(): void {
    this.showCreateDialog.set(false);
    this.editingLocation.set(null);
    this.form.reset({ building: '', address: '', hasMultipleFloors: false, floor: null });
  }
}
