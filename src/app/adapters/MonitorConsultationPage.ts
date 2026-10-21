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
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { ListMonitorsUseCase } from '../application/use-cases/ListMonitorsUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { UpdateMonitorUseCase } from '../application/use-cases/UpdateMonitorUseCase';
import {
  GenerateMonitorConsultationExcelUseCase,
  MonitorRow,
} from '../application/use-cases/GenerateMonitorConsultationExcelUseCase';
import { MonitorStore } from '../application/MonitorStore';
import { EntityStore } from '../application/EntityStore';

type StatusFilter = 'activo' | 'inactivo';

@Component({
  selector: 'app-monitor-consultation-page',
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
    TagModule,
    Select,
  ],
  templateUrl: './MonitorConsultationPage.html',
  styleUrl: './AssetConsultationPage.css',
})
export class MonitorConsultationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listMonitorsUseCase = inject(ListMonitorsUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly updateMonitorUseCase = inject(UpdateMonitorUseCase);
  private readonly generateMonitorConsultationExcelUseCase = inject(GenerateMonitorConsultationExcelUseCase);
  private readonly monitorStore = inject(MonitorStore);
  private readonly entityStore = inject(EntityStore);

  readonly loading = signal(true);
  readonly generatingExcel = signal(false);

  readonly searchFilter = signal('');
  readonly brandFilter = signal<string | null>(null);
  readonly entityFilter = signal<string | null>(null);
  readonly statusFilter = signal<StatusFilter | null>(null);

  readonly statusOptions = [
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' },
  ];

  private readonly entityLabels = computed(
    () => new Map(this.entityStore.entities().map((entity) => [entity.id, entity.name])),
  );

  readonly monitors = computed<MonitorRow[]>(() => {
    const labels = this.entityLabels();
    return this.monitorStore.monitors().map((monitor) => ({ ...monitor, entity: labels.get(monitor.entityId) ?? '' }));
  });

  readonly brandOptions = computed(() =>
    [...new Set(this.monitors().map((monitor) => monitor.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );
  readonly entityOptions = computed(() =>
    [...new Set(this.monitors().map((monitor) => monitor.entity).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );

  readonly entityFormOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );

  readonly total = computed(() => this.monitors().length);

  readonly filteredMonitors = computed(() => {
    const search = this.searchFilter().trim().toLowerCase();
    const brand = this.brandFilter();
    const entity = this.entityFilter();
    const status = this.statusFilter();

    return this.monitors()
      .filter((monitor) =>
        search
          ? [monitor.inventoryNumber, monitor.serialNumber, monitor.model, monitor.networkAddress].some((value) =>
              value.toLowerCase().includes(search),
            )
          : true,
      )
      .filter((monitor) => (brand ? monitor.brand === brand : true))
      .filter((monitor) => (entity ? monitor.entity === entity : true))
      .filter((monitor) => (status ? monitor.active === (status === 'activo') : true))
      .sort((a, b) => a.inventoryNumber.localeCompare(b.inventoryNumber));
  });

  readonly resultCount = computed(() => this.filteredMonitors().length);

  readonly hasActiveFilters = computed(
    () => !!(this.searchFilter() || this.brandFilter() || this.entityFilter() || this.statusFilter()),
  );

  readonly showEditDialog = signal(false);
  readonly editSubmitting = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  private editingMonitorId: string | null = null;

  readonly editForm = this.fb.nonNullable.group({
    userId: [''],
    inventoryNumber: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    serialNumber: ['', Validators.required],
    entityId: ['', Validators.required],
    networkAddress: [''],
    active: [true],
  });

  ngOnInit(): void {
    this.listMonitorsUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listEntitiesUseCase.execute().subscribe();
  }

  onSearchFilterInput(value: string): void {
    this.searchFilter.set(value);
  }

  async exportarExcel(): Promise<void> {
    if (this.generatingExcel()) {
      return;
    }

    this.generatingExcel.set(true);
    try {
      const excelBytes = this.generateMonitorConsultationExcelUseCase.execute(this.filteredMonitors());
      const blob = new Blob([excelBytes as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'consulta-de-monitores.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      this.generatingExcel.set(false);
    }
  }

  clearFilters(): void {
    this.searchFilter.set('');
    this.brandFilter.set(null);
    this.entityFilter.set(null);
    this.statusFilter.set(null);
  }

  isEditInvalid(controlName: keyof typeof this.editForm.controls): boolean {
    const control = this.editForm.controls[controlName];
    return control.invalid && control.touched;
  }

  isEditActive(): boolean {
    return this.editForm.controls.active.value;
  }

  toggleEditActive(): void {
    this.editForm.controls.active.setValue(!this.isEditActive());
  }

  openEditDialog(monitor: MonitorRow): void {
    this.editingMonitorId = monitor.id;
    this.editErrorMessage.set(null);
    this.editForm.reset({
      userId: monitor.userId,
      inventoryNumber: monitor.inventoryNumber,
      brand: monitor.brand,
      model: monitor.model,
      serialNumber: monitor.serialNumber,
      entityId: monitor.entityId,
      networkAddress: monitor.networkAddress,
      active: monitor.active,
    });
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingMonitorId = null;
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || this.editSubmitting() || !this.editingMonitorId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editSubmitting.set(true);
    this.editErrorMessage.set(null);

    this.updateMonitorUseCase.execute(this.editingMonitorId, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.showEditDialog.set(false);
        this.editingMonitorId = null;
      },
      error: () => {
        this.editSubmitting.set(false);
        this.editErrorMessage.set('No se pudo actualizar el monitor. Intenta nuevamente.');
      },
    });
  }
}
