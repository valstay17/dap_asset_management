import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { ListAreaManagersUseCase } from '../application/use-cases/ListAreaManagersUseCase';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { AreaManagerStore } from '../application/AreaManagerStore';
import { formatLocationLabel } from '../domain/models/SiteLocation';

@Component({
  selector: 'app-printer-capture-page',
  imports: [ReactiveFormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './PrinterCapturePage.html',
  styleUrl: './AssetCapturePage.css',
})
export class PrinterCapturePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly listAreaManagersUseCase = inject(ListAreaManagersUseCase);
  private readonly entityStore = inject(EntityStore);
  private readonly locationStore = inject(LocationStore);
  private readonly areaManagerStore = inject(AreaManagerStore);

  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );

  readonly areaManagerOptions = computed(() =>
    this.areaManagerStore
      .areaManagers()
      .filter((areaManager) => areaManager.active)
      .map((areaManager) => ({ id: areaManager.id, label: areaManager.name })),
  );

  readonly locationOptions = computed(() =>
    this.locationStore
      .locations()
      .filter((location) => location.active)
      .map((location) => ({ id: location.id, label: formatLocationLabel(location) })),
  );

  readonly infoMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    inventoryNumber: ['', Validators.required],
    model: ['', Validators.required],
    type: ['', Validators.required],
    serialNumber: ['', Validators.required],
    locationId: ['', Validators.required],
    entityId: ['', Validators.required],
    custodianId: ['', Validators.required],
    manufacturer: ['', Validators.required],
    active: [true],
  });

  ngOnInit(): void {
    this.listEntitiesUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
    this.listAreaManagersUseCase.execute().subscribe();
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

  // TODO: conectar con el backend cuando exista el endpoint de impresoras.
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.infoMessage.set('El registro de impresoras aún no está conectado al servidor; los datos no se guardaron.');
  }
}
