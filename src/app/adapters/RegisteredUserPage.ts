import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { CreateUserUseCase } from '../application/use-cases/CreateUserUseCase';
import { ToggleUserStatusUseCase } from '../application/use-cases/ToggleUserStatusUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { ListAssetsUseCase } from '../application/use-cases/ListAssetsUseCase';
import { ListPhonesUseCase } from '../application/use-cases/ListPhonesUseCase';
import { ListMonitorsUseCase } from '../application/use-cases/ListMonitorsUseCase';
import { ListPrintersUseCase } from '../application/use-cases/ListPrintersUseCase';
import { UpdateAssetUseCase } from '../application/use-cases/UpdateAssetUseCase';
import { UpdatePhoneUseCase } from '../application/use-cases/UpdatePhoneUseCase';
import { UpdateMonitorUseCase } from '../application/use-cases/UpdateMonitorUseCase';
import { UpdatePrinterUseCase } from '../application/use-cases/UpdatePrinterUseCase';
import { UserStore } from '../application/UserStore';
import { AssetStore } from '../application/AssetStore';
import { PhoneStore } from '../application/PhoneStore';
import { MonitorStore } from '../application/MonitorStore';
import { PrinterStore } from '../application/PrinterStore';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { NewUser, User } from '../domain/models/User';
import { formatLocationLabel } from '../domain/models/SiteLocation';
import { Avatar } from "primeng/avatar";

type AssignKind = 'asset' | 'phone' | 'monitor' | 'printer';

interface AssignableItem {
  id: string;
  userId: string;
  available: boolean;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-registered-user-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    Select,
    MessageModule,
    TooltipModule,
    Avatar
],
  templateUrl: './RegisteredUserPage.html',
  styleUrl: './RegisteredUserPage.css',
})
export class RegisteredUserPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listUsersUseCase = inject(ListUsersUseCase);
  private readonly createUserUseCase = inject(CreateUserUseCase);
  private readonly toggleUserStatusUseCase = inject(ToggleUserStatusUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly userStore = inject(UserStore);
  private readonly entityStore = inject(EntityStore);
  private readonly locationStore = inject(LocationStore);
  private readonly listAssetsUseCase = inject(ListAssetsUseCase);
  private readonly listPhonesUseCase = inject(ListPhonesUseCase);
  private readonly listMonitorsUseCase = inject(ListMonitorsUseCase);
  private readonly listPrintersUseCase = inject(ListPrintersUseCase);
  private readonly updateAssetUseCase = inject(UpdateAssetUseCase);
  private readonly updatePhoneUseCase = inject(UpdatePhoneUseCase);
  private readonly updateMonitorUseCase = inject(UpdateMonitorUseCase);
  private readonly updatePrinterUseCase = inject(UpdatePrinterUseCase);
  private readonly assetStore = inject(AssetStore);
  private readonly phoneStore = inject(PhoneStore);
  private readonly monitorStore = inject(MonitorStore);
  private readonly printerStore = inject(PrinterStore);

  readonly entityOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0)
      .map((entity) => entity.name),
  );
  readonly entityFormOptions = computed(() =>
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

  readonly users = this.userStore.users;
  readonly total = this.userStore.total;
  readonly activeCount = this.userStore.activeCount;
  readonly inactiveCount = this.userStore.inactiveCount;

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly togglingIds = signal<ReadonlySet<string>>(new Set());
  readonly editingUser = signal<User | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    entityId: ['', Validators.required],
    locationId: ['', Validators.required],
  });

  readonly assignKindOptions: { value: AssignKind; label: string; icon: string }[] = [
    { value: 'asset', label: 'Bienes', icon: 'computer' },
    { value: 'phone', label: 'Teléfonos', icon: 'call' },
    { value: 'monitor', label: 'Monitores', icon: 'desktop_windows' },
    { value: 'printer', label: 'Impresoras', icon: 'print' },
  ];

  readonly showAssignDialog = signal(false);
  readonly assigningUser = signal<User | null>(null);
  readonly assignKind = signal<AssignKind | null>(null);
  readonly assignItemId = signal<string | null>(null);
  readonly assignSubmitting = signal(false);
  readonly unassigningIds = signal<ReadonlySet<string>>(new Set());
  readonly assignMessage = signal<string | null>(null);
  readonly assignErrorMessage = signal<string | null>(null);

  // Vista común de los cuatro tipos para contar, listar y asignar.
  private readonly itemsByKind = computed<Record<AssignKind, AssignableItem[]>>(() => ({
    asset: this.assetStore.assets().map((asset) => ({
      id: asset.id,
      userId: asset.userId,
      available: !asset.userId,
      title: `${asset.name} · ${asset.type}`,
      detail: `Inv. ${asset.inventoryNumber || 'N/A'} · Serie ${asset.serialNumber || 'N/A'} · ${asset.model}`,
    })),
    phone: this.phoneStore.phones().map((phone) => ({
      id: phone.id,
      userId: phone.userId,
      available: !phone.userId && phone.active,
      title: `${phone.brand} ${phone.model}`,
      detail: `Inv. ${phone.inventoryNumber} · Ext. ${phone.extension || 'N/A'} · IP ${phone.networkAddress || 'N/A'}`,
    })),
    monitor: this.monitorStore.monitors().map((monitor) => ({
      id: monitor.id,
      userId: monitor.userId,
      available: !monitor.userId && monitor.active,
      title: `${monitor.brand} ${monitor.model}`,
      detail: `Inv. ${monitor.inventoryNumber} · Serie ${monitor.serialNumber}`,
    })),
    printer: this.printerStore.printers().map((printer) => ({
      id: printer.id,
      userId: printer.userId,
      available: !printer.userId && printer.active,
      title: `${printer.brand} ${printer.type}`,
      detail: `Inv. ${printer.inventoryNumber} · Serie ${printer.serialNumber}`,
    })),
  }));

  readonly assignedCounts = computed(() => {
    const userId = this.assigningUser()?.id;
    const items = this.itemsByKind();
    const count = (kind: AssignKind) => items[kind].filter((item) => item.userId === userId).length;
    return { asset: count('asset'), phone: count('phone'), monitor: count('monitor'), printer: count('printer') };
  });

  readonly assignedItems = computed(() => {
    const kind = this.assignKind();
    const userId = this.assigningUser()?.id;
    return kind ? this.itemsByKind()[kind].filter((item) => item.userId === userId) : [];
  });

  readonly availableItemOptions = computed(() => {
    const kind = this.assignKind();
    return kind
      ? this.itemsByKind()
          [kind].filter((item) => item.available)
          .map((item) => ({ id: item.id, label: `${item.title} · ${item.detail}` }))
      : [];
  });

  readonly assignKindLabel = computed(
    () => this.assignKindOptions.find((option) => option.value === this.assignKind())?.label ?? '',
  );

  readonly initialsByUserId = computed(() => {
    const map: Record<string, string> = {};
    for (const user of this.users()) {
      map[user.id] = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
    }
    return map;
  });

  ngOnInit(): void {
    this.listUsersUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listEntitiesUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
  }

  toggleStatus(user: User): void {
    if (this.togglingIds().has(user.id)) {
      return;
    }

    this.togglingIds.update((ids) => new Set(ids).add(user.id));

    const clearToggling = () => {
      this.togglingIds.update((ids) => {
        const next = new Set(ids);
        next.delete(user.id);
        return next;
      });
    };

    this.toggleUserStatusUseCase.execute(user).subscribe({
      next: clearToggling,
      error: clearToggling,
    });
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  openCreateDialog(): void {
    this.errorMessage.set(null);
    this.editingUser.set(null);
    this.form.reset();
    this.showCreateDialog.set(true);
  }

  openEditDialog(user: User): void {
    this.errorMessage.set(null);
    this.editingUser.set(user);
    this.form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      entityId: user.entityId,
      locationId: user.locationId,
    });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as NewUser;

    // TODO: conectar con el endpoint de actualización cuando esté disponible; por ahora solo afecta la vista.
    const editing = this.editingUser();
    if (editing) {
      const entity = this.entityStore.entities().find((candidate) => candidate.id === payload.entityId);
      const location = this.locationStore.locations().find((candidate) => candidate.id === payload.locationId);
      this.userStore.updateUser({
        ...editing,
        ...payload,
        entity: entity?.name ?? editing.entity,
        location: location ? formatLocationLabel(location) : editing.location,
      });
      this.closeAndResetForm();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.createUserUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAndResetForm();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar el usuario. Intenta nuevamente.');
      },
    });
  }

  openAssignDialog(user: User): void {
    this.assigningUser.set(user);
    this.assignKind.set(null);
    this.assignItemId.set(null);
    this.assignMessage.set(null);
    this.assignErrorMessage.set(null);
    this.showAssignDialog.set(true);

    this.listAssetsUseCase.execute().subscribe();
    this.listPhonesUseCase.execute().subscribe();
    this.listMonitorsUseCase.execute().subscribe();
    this.listPrintersUseCase.execute().subscribe();
  }

  closeAssignDialog(): void {
    this.showAssignDialog.set(false);
    this.assigningUser.set(null);
  }

  selectAssignKind(kind: AssignKind): void {
    this.assignKind.update((current) => (current === kind ? null : kind));
    this.assignItemId.set(null);
    this.assignMessage.set(null);
    this.assignErrorMessage.set(null);
  }

  onAssignSubmit(): void {
    const user = this.assigningUser();
    const kind = this.assignKind();
    const itemId = this.assignItemId();
    if (!user || !kind || !itemId || this.assignSubmitting()) {
      return;
    }

    const request = this.buildAssignRequest(kind, itemId, user.id);
    if (!request) {
      return;
    }

    this.assignSubmitting.set(true);
    this.assignMessage.set(null);
    this.assignErrorMessage.set(null);

    request.subscribe({
      next: () => {
        this.assignSubmitting.set(false);
        this.assignItemId.set(null);
        this.assignMessage.set(`Agregado a ${user.firstName} ${user.lastName}.`);
      },
      error: () => {
        this.assignSubmitting.set(false);
        this.assignErrorMessage.set('No se pudo realizar la asignación. Intenta nuevamente.');
      },
    });
  }

  unassign(itemId: string): void {
    const kind = this.assignKind();
    if (!kind || this.unassigningIds().has(itemId)) {
      return;
    }

    const request = this.buildAssignRequest(kind, itemId, '');
    if (!request) {
      return;
    }

    const clearUnassigning = () => {
      this.unassigningIds.update((ids) => {
        const next = new Set(ids);
        next.delete(itemId);
        return next;
      });
    };

    this.unassigningIds.update((ids) => new Set(ids).add(itemId));
    this.assignMessage.set(null);
    this.assignErrorMessage.set(null);

    request.subscribe({
      next: clearUnassigning,
      error: () => {
        clearUnassigning();
        this.assignErrorMessage.set('No se pudo quitar la asignación. Intenta nuevamente.');
      },
    });
  }

  private buildAssignRequest(kind: AssignKind, itemId: string, userId: string): Observable<unknown> | null {
    switch (kind) {
      case 'asset': {
        const asset = this.assetStore.assets().find((candidate) => candidate.id === itemId);
        if (!asset) return null;
        const { id, user, custodian, entity, type, location, updatedAt, ...changes } = asset;
        return this.updateAssetUseCase.execute(id, { ...changes, userId });
      }
      case 'phone': {
        const phone = this.phoneStore.phones().find((candidate) => candidate.id === itemId);
        if (!phone) return null;
        const { id, ...changes } = phone;
        return this.updatePhoneUseCase.execute(id, { ...changes, userId });
      }
      case 'monitor': {
        const monitor = this.monitorStore.monitors().find((candidate) => candidate.id === itemId);
        if (!monitor) return null;
        const { id, ...changes } = monitor;
        return this.updateMonitorUseCase.execute(id, { ...changes, userId });
      }
      case 'printer': {
        const printer = this.printerStore.printers().find((candidate) => candidate.id === itemId);
        if (!printer) return null;
        const { id, ...changes } = printer;
        return this.updatePrinterUseCase.execute(id, { ...changes, userId });
      }
    }
  }

  private closeAndResetForm(): void {
    this.showCreateDialog.set(false);
    this.editingUser.set(null);
    this.form.reset();
  }
}
