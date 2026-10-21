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
import { ListPhonesUseCase } from '../application/use-cases/ListPhonesUseCase';
import { ListEntitiesUseCase } from '../application/use-cases/ListEntitiesUseCase';
import { UpdatePhoneUseCase } from '../application/use-cases/UpdatePhoneUseCase';
import {
  GeneratePhoneConsultationExcelUseCase,
  PhoneRow,
} from '../application/use-cases/GeneratePhoneConsultationExcelUseCase';
import { PhoneStore } from '../application/PhoneStore';
import { EntityStore } from '../application/EntityStore';

type StatusFilter = 'activo' | 'inactivo';

@Component({
  selector: 'app-phone-consultation-page',
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
  templateUrl: './PhoneConsultationPage.html',
  styleUrl: './AssetConsultationPage.css',
})
export class PhoneConsultationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listPhonesUseCase = inject(ListPhonesUseCase);
  private readonly listEntitiesUseCase = inject(ListEntitiesUseCase);
  private readonly updatePhoneUseCase = inject(UpdatePhoneUseCase);
  private readonly generatePhoneConsultationExcelUseCase = inject(GeneratePhoneConsultationExcelUseCase);
  private readonly phoneStore = inject(PhoneStore);
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

  readonly phones = computed<PhoneRow[]>(() => {
    const labels = this.entityLabels();
    return this.phoneStore.phones().map((phone) => ({ ...phone, entity: labels.get(phone.entityId) ?? '' }));
  });

  readonly brandOptions = computed(() =>
    [...new Set(this.phones().map((phone) => phone.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );
  readonly entityOptions = computed(() =>
    [...new Set(this.phones().map((phone) => phone.entity).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );

  readonly entityFormOptions = computed(() =>
    this.entityStore
      .entities()
      .filter((entity) => entity.level !== 0 && entity.active)
      .map((entity) => ({ id: entity.id, label: entity.name })),
  );

  readonly total = computed(() => this.phones().length);

  readonly filteredPhones = computed(() => {
    const search = this.searchFilter().trim().toLowerCase();
    const brand = this.brandFilter();
    const entity = this.entityFilter();
    const status = this.statusFilter();

    return this.phones()
      .filter((phone) =>
        search
          ? [phone.inventoryNumber, phone.serialNumber, phone.model, phone.networkAddress, phone.extension].some(
              (value) => value.toLowerCase().includes(search),
            )
          : true,
      )
      .filter((phone) => (brand ? phone.brand === brand : true))
      .filter((phone) => (entity ? phone.entity === entity : true))
      .filter((phone) => (status ? phone.active === (status === 'activo') : true))
      .sort((a, b) => a.inventoryNumber.localeCompare(b.inventoryNumber));
  });

  readonly resultCount = computed(() => this.filteredPhones().length);

  readonly hasActiveFilters = computed(
    () => !!(this.searchFilter() || this.brandFilter() || this.entityFilter() || this.statusFilter()),
  );

  readonly showEditDialog = signal(false);
  readonly editSubmitting = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  private editingPhoneId: string | null = null;

  readonly editForm = this.fb.nonNullable.group({
    userId: [''],
    inventoryNumber: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    serialNumber: ['', Validators.required],
    entityId: ['', Validators.required],
    networkAddress: [''],
    extension: [''],
    active: [true],
  });

  ngOnInit(): void {
    this.listPhonesUseCase.execute().subscribe({
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
      const excelBytes = this.generatePhoneConsultationExcelUseCase.execute(this.filteredPhones());
      const blob = new Blob([excelBytes as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'consulta-de-telefonos.xlsx';
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

  openEditDialog(phone: PhoneRow): void {
    this.editingPhoneId = phone.id;
    this.editErrorMessage.set(null);
    this.editForm.reset({
      userId: phone.userId,
      inventoryNumber: phone.inventoryNumber,
      brand: phone.brand,
      model: phone.model,
      serialNumber: phone.serialNumber,
      entityId: phone.entityId,
      networkAddress: phone.networkAddress,
      extension: phone.extension,
      active: phone.active,
    });
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingPhoneId = null;
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || this.editSubmitting() || !this.editingPhoneId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editSubmitting.set(true);
    this.editErrorMessage.set(null);

    this.updatePhoneUseCase.execute(this.editingPhoneId, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.showEditDialog.set(false);
        this.editingPhoneId = null;
      },
      error: () => {
        this.editSubmitting.set(false);
        this.editErrorMessage.set('No se pudo actualizar el teléfono. Intenta nuevamente.');
      },
    });
  }
}
