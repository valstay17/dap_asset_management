import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { ListAssetsUseCase } from '../application/use-cases/ListAssetsUseCase';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { ListAssetTypesUseCase } from '../application/use-cases/ListAssetTypesUseCase';
import { UpdateAssetUseCase } from '../application/use-cases/UpdateAssetUseCase';
import { AssetStore } from '../application/AssetStore';
import { UserStore } from '../application/UserStore';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { AssetTypeStore } from '../application/AssetTypeStore';
import { Asset, NewAsset } from '../domain/models/Asset';
import { formatLocationLabel } from '../domain/models/SiteLocation';

@Component({
  selector: 'app-asset-consultation-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    TooltipModule,
    Select,
  ],
  templateUrl: './AssetConsultationPage.html',
  styleUrl: './AssetConsultationPage.css',
})
export class AssetConsultationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listAssetsUseCase = inject(ListAssetsUseCase);
  private readonly listUsersUseCase = inject(ListUsersUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly listAssetTypesUseCase = inject(ListAssetTypesUseCase);
  private readonly updateAssetUseCase = inject(UpdateAssetUseCase);
  private readonly assetStore = inject(AssetStore);
  private readonly userStore = inject(UserStore);
  private readonly entityStore = inject(EntityStore);
  private readonly locationStore = inject(LocationStore);
  private readonly assetTypeStore = inject(AssetTypeStore);

  readonly loading = signal(true);

  readonly nameFilter = signal('');
  readonly userFilter = signal<string | null>(null);
  readonly entityFilter = signal<string | null>(null);
  readonly locationFilter = signal<string | null>(null);

  readonly userOptions = computed(() => this.userStore.users().map((user) => `${user.firstName} ${user.lastName}`));
  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0)
      .map((entity) => entity.name),
  );
  readonly locationOptions = computed(() => this.locationStore.locations().map(formatLocationLabel));
  readonly typeOptions = computed(() => this.assetTypeStore.assetTypes().map((assetType) => assetType.name));

  readonly total = computed(() => this.assetStore.assets().length);

  readonly filteredAssets = computed(() => {
    const name = this.nameFilter().trim().toLowerCase();
    const user = this.userFilter();
    const entity = this.entityFilter();
    const location = this.locationFilter();

    return this.assetStore
      .assets()
      .filter((asset) => (name ? asset.name.toLowerCase().includes(name) : true))
      .filter((asset) => (user ? asset.user === user : true))
      .filter((asset) => (entity ? asset.entity === entity : true))
      .filter((asset) => (location ? asset.location === location : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly resultCount = computed(() => this.filteredAssets().length);

  readonly hasActiveFilters = computed(
    () => !!(this.nameFilter() || this.userFilter() || this.entityFilter() || this.locationFilter()),
  );

  readonly showEditDialog = signal(false);
  readonly editSubmitting = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  private editingAssetId: string | null = null;

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    user: [''],
    custodian: [''],
    entity: ['', Validators.required],
    manufacturer: [''],
    serialNumber: [''],
    inventoryNumber: [''],
    type: ['', Validators.required],
    model: [''],
    operatingSystem: [''],
    location: ['', Validators.required],
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
    this.listAssetsUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listUsersUseCase.execute().subscribe();
    this.listEntitiesUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
    this.listAssetTypesUseCase.execute().subscribe();
  }

  onNameFilterInput(value: string): void {
    this.nameFilter.set(value);
  }

  clearFilters(): void {
    this.nameFilter.set('');
    this.userFilter.set(null);
    this.entityFilter.set(null);
    this.locationFilter.set(null);
  }

  isEditInvalid(controlName: keyof typeof this.editForm.controls): boolean {
    const control = this.editForm.controls[controlName];
    return control.invalid && control.touched;
  }

  openEditDialog(asset: Asset): void {
    this.editingAssetId = asset.id;
    this.editErrorMessage.set(null);
    this.editForm.reset({
      name: asset.name,
      user: asset.user,
      custodian: asset.custodian,
      entity: asset.entity,
      manufacturer: asset.manufacturer,
      serialNumber: asset.serialNumber,
      inventoryNumber: asset.inventoryNumber,
      type: asset.type,
      model: asset.model,
      operatingSystem: asset.operatingSystem,
      location: asset.location,
      processor: asset.processor,
      memoryRAM: asset.memoryRAM,
      hardDiskType: asset.hardDiskType,
      hardDiskCapacity: asset.hardDiskCapacity,
      processorNumber: asset.processorNumber,
      networkAddress: asset.networkAddress,
      macAddress: asset.macAddress,
      macAddressNetwork: asset.macAddressNetwork,
    });
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingAssetId = null;
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || this.editSubmitting() || !this.editingAssetId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editSubmitting.set(true);
    this.editErrorMessage.set(null);

    this.updateAssetUseCase.execute(this.editingAssetId, this.editForm.getRawValue() as NewAsset).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.showEditDialog.set(false);
        this.editingAssetId = null;
      },
      error: () => {
        this.editSubmitting.set(false);
        this.editErrorMessage.set('No se pudo actualizar el equipo. Intenta nuevamente.');
      },
    });
  }
}
