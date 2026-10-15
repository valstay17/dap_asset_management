import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { ListAreaManagersUseCase } from '../application/use-cases/ListAreaManagersUseCase';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { AreaManagerStore } from '../application/AreaManagerStore';
import { UserStore } from '../application/UserStore';
import { formatLocationLabel } from '../domain/models/SiteLocation';

@Component({
  selector: 'app-monitor-capture-page',
  imports: [ReactiveFormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './MonitorCapturePage.html',
  styleUrl: './AssetCapturePage.css',
})
export class MonitorCapturePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly listAreaManagersUseCase = inject(ListAreaManagersUseCase);
  private readonly listUsersUseCase = inject(ListUsersUseCase);
  private readonly entityStore = inject(EntityStore);
  private readonly locationStore = inject(LocationStore);
  private readonly areaManagerStore = inject(AreaManagerStore);
  private readonly userStore = inject(UserStore);

  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );

  readonly userOptions = computed(() =>
    this.userStore
      .users()
      .filter((user) => user.status === 'activo')
      .map((user) => ({ id: user.id, label: `${user.firstName} ${user.lastName}` })),
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
    serialNumber: ['', Validators.required],
    entityId: ['', Validators.required],
    custodianId: ['', Validators.required],
    userId: ['', Validators.required],
    locationId: ['', Validators.required],
    manufacturer: ['', Validators.required],
    type: ['', Validators.required],
    model: ['', Validators.required],
    active: [true],
  });

  ngOnInit(): void {
    this.listEntitiesUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
    this.listAreaManagersUseCase.execute().subscribe();
    this.listUsersUseCase.execute().subscribe();
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

  // TODO: conectar con el backend cuando exista el endpoint de monitores.
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.infoMessage.set('El registro de monitores aún no está conectado al servidor; los datos no se guardaron.');
  }
}
