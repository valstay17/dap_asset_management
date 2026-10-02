import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { CaptureAssetUseCase } from '../application/use-cases/CaptureAssetUseCase';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { ListAssetTypesUseCase } from '../application/use-cases/ListAssetTypesUseCase';
import { ListAreaManagersUseCase } from '../application/use-cases/ListAreaManagersUseCase';
import { UserStore } from '../application/UserStore';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { AssetTypeStore } from '../application/AssetTypeStore';
import { AreaManagerStore } from '../application/AreaManagerStore';
import { NewAsset } from '../domain/models/Asset';
import { formatLocationLabel } from '../domain/models/SiteLocation';

const STATUS_OPTIONS = [
  { label: 'Activo', value: 'activo' },
  { label: 'Mantenimiento', value: 'mantenimiento' },
  { label: 'Baja', value: 'baja' },
];

@Component({
  selector: 'app-asset-capture-page',
  imports: [ReactiveFormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './AssetCapturePage.html',
  styleUrl: './AssetCapturePage.css',
})
export class AssetCapturePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly captureAssetUseCase = inject(CaptureAssetUseCase);
  private readonly listUsersUseCase = inject(ListUsersUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly listAssetTypesUseCase = inject(ListAssetTypesUseCase);
  private readonly listAreaManagersUseCase = inject(ListAreaManagersUseCase);
  private readonly userStore = inject(UserStore);
  private readonly entityStore = inject(EntityStore);
  private readonly locationStore = inject(LocationStore);
  private readonly assetTypeStore = inject(AssetTypeStore);
  private readonly areaManagerStore = inject(AreaManagerStore);
  private readonly router = inject(Router);

  readonly statusOptions = STATUS_OPTIONS;

  readonly userOptions = computed(() =>
    this.userStore
      .users()
      .filter((user) => user.status === 'activo')
      .map((user) => ({ id: user.id, label: `${user.firstName} ${user.lastName}` })),
  );
  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );
  readonly locationOptions = computed(() =>
    this.locationStore
      .locations()
      .filter((location) => location.active)
      .map((location) => ({ id: location.id, label: formatLocationLabel(location) })),
  );
  readonly typeOptions = computed(() =>
    this.assetTypeStore
      .assetTypes()
      .filter((assetType) => assetType.active)
      .map((assetType) => ({ id: assetType.id, label: assetType.name })),
  );
  readonly areaManagerOptions = computed(() =>
    this.areaManagerStore
      .areaManagers()
      .filter((areaManager) => areaManager.active)
      .map((areaManager) => ({ id: areaManager.id, label: areaManager.name })),
  );

  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    userId: ['', Validators.required],
    custodianId: ['', Validators.required],
    entityId: ['', Validators.required],
    manufacturer: [''],
    serialNumber: [''],
    inventoryNumber: [''],
    typeId: ['', Validators.required],
    model: [''],
    operatingSystem: [''],
    locationId: ['', Validators.required],
    processor: [''],
    memoryRAM: [''],
    hardDiskType: [''],
    hardDiskCapacity: [''],
    processorNumber: [''],
    networkAddress: [''],
    macAddress: [''],
    macAddressNetwork: [''],
  });

  ngOnInit(): void {
    this.listUsersUseCase.execute().subscribe();
    this.listEntitiesUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
    this.listAssetTypesUseCase.execute().subscribe();
    this.listAreaManagersUseCase.execute().subscribe();
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.captureAssetUseCase.execute(this.form.getRawValue() as NewAsset).subscribe({
      next: (asset) => {
        this.submitting.set(false);
        this.successMessage.set(`Equipo "${asset.name}" registrado correctamente.`);
        this.router.navigateByUrl('/capture/consulta');
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar el equipo. Intenta nuevamente.');
      },
    });
  }

}
