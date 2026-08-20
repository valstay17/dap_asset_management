import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { ListAssetsUseCase } from '../application/use-cases/ListAssetsUseCase';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { AssetStore } from '../application/AssetStore';
import { UserStore } from '../application/UserStore';
import { EntityStore } from '../application/EntityStore';
import { LocationStore } from '../application/LocationStore';
import { formatLocationLabel } from '../domain/models/SiteLocation';

@Component({
  selector: 'app-asset-consultation-page',
  imports: [FormsModule, TableModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, Select],
  templateUrl: './AssetConsultationPage.html',
  styleUrl: './AssetConsultationPage.css',
})
export class AssetConsultationPage implements OnInit {
  private readonly listAssetsUseCase = inject(ListAssetsUseCase);
  private readonly listUsersUseCase = inject(ListUsersUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly assetStore = inject(AssetStore);
  private readonly userStore = inject(UserStore);
  private readonly entityStore = inject(EntityStore);
  private readonly locationStore = inject(LocationStore);

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

  ngOnInit(): void {
    this.listAssetsUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listUsersUseCase.execute().subscribe();
    this.listEntitiesUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
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
}
