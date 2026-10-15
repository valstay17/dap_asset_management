import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { UserStore } from '../application/UserStore';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { NewUser, User } from '../domain/models/User';
import { formatLocationLabel } from '../domain/models/SiteLocation';
import { Avatar } from "primeng/avatar";

@Component({
  selector: 'app-registered-user-page',
  imports: [
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

  private closeAndResetForm(): void {
    this.showCreateDialog.set(false);
    this.editingUser.set(null);
    this.form.reset();
  }
}
