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
import { ListPrintersUseCase } from '../application/use-cases/ListPrintersUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { UpdatePrinterUseCase } from '../application/use-cases/UpdatePrinterUseCase';
import {
  GeneratePrinterConsultationExcelUseCase,
  PrinterRow,
} from '../application/use-cases/GeneratePrinterConsultationExcelUseCase';
import { PrinterStore } from '../application/PrinterStore';
import { LocationStore } from '../application/LocationStore';
import { formatLocationLabel } from '../domain/models/SiteLocation';

type StatusFilter = 'activo' | 'inactivo';

@Component({
  selector: 'app-printer-consultation-page',
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
  templateUrl: './PrinterConsultationPage.html',
  styleUrl: './AssetConsultationPage.css',
})
export class PrinterConsultationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listPrintersUseCase = inject(ListPrintersUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly updatePrinterUseCase = inject(UpdatePrinterUseCase);
  private readonly generatePrinterConsultationExcelUseCase = inject(GeneratePrinterConsultationExcelUseCase);
  private readonly printerStore = inject(PrinterStore);
  private readonly locationStore = inject(LocationStore);

  readonly loading = signal(true);
  readonly generatingExcel = signal(false);

  readonly searchFilter = signal('');
  readonly typeFilter = signal<string | null>(null);
  readonly locationFilter = signal<string | null>(null);
  readonly statusFilter = signal<StatusFilter | null>(null);

  readonly statusOptions = [
    { value: 'activo', label: 'Activas' },
    { value: 'inactivo', label: 'Inactivas' },
  ];

  private readonly locationLabels = computed(
    () => new Map(this.locationStore.locations().map((location) => [location.id, formatLocationLabel(location)])),
  );

  readonly printers = computed<PrinterRow[]>(() => {
    const labels = this.locationLabels();
    return this.printerStore
      .printers()
      .map((printer) => ({ ...printer, location: labels.get(printer.locationId) ?? '' }));
  });

  readonly typeOptions = computed(() =>
    [...new Set(this.printers().map((printer) => printer.type).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );
  readonly locationOptions = computed(() =>
    [...new Set(this.printers().map((printer) => printer.location).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );

  readonly locationFormOptions = computed(() =>
    this.locationStore
      .locations()
      .filter((location) => location.active)
      .map((location) => ({ id: location.id, label: formatLocationLabel(location) })),
  );

  readonly total = computed(() => this.printers().length);

  readonly filteredPrinters = computed(() => {
    const search = this.searchFilter().trim().toLowerCase();
    const type = this.typeFilter();
    const location = this.locationFilter();
    const status = this.statusFilter();

    return this.printers()
      .filter((printer) =>
        search
          ? [printer.inventoryNumber, printer.serialNumber, printer.brand, printer.manufacturer].some((value) =>
              value.toLowerCase().includes(search),
            )
          : true,
      )
      .filter((printer) => (type ? printer.type === type : true))
      .filter((printer) => (location ? printer.location === location : true))
      .filter((printer) => (status ? printer.active === (status === 'activo') : true))
      .sort((a, b) => a.inventoryNumber.localeCompare(b.inventoryNumber));
  });

  readonly resultCount = computed(() => this.filteredPrinters().length);

  readonly hasActiveFilters = computed(
    () => !!(this.searchFilter() || this.typeFilter() || this.locationFilter() || this.statusFilter()),
  );

  readonly showEditDialog = signal(false);
  readonly editSubmitting = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  private editingPrinterId: string | null = null;

  readonly editForm = this.fb.nonNullable.group({
    userId: [''],
    inventoryNumber: ['', Validators.required],
    brand: ['', Validators.required],
    type: ['', Validators.required],
    serialNumber: ['', Validators.required],
    locationId: ['', Validators.required],
    manufacturer: ['', Validators.required],
    active: [true],
  });

  ngOnInit(): void {
    this.listPrintersUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listLocationsUseCase.execute().subscribe();
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
      const excelBytes = this.generatePrinterConsultationExcelUseCase.execute(this.filteredPrinters());
      const blob = new Blob([excelBytes as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'consulta-de-impresoras.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      this.generatingExcel.set(false);
    }
  }

  clearFilters(): void {
    this.searchFilter.set('');
    this.typeFilter.set(null);
    this.locationFilter.set(null);
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

  openEditDialog(printer: PrinterRow): void {
    this.editingPrinterId = printer.id;
    this.editErrorMessage.set(null);
    this.editForm.reset({
      userId: printer.userId,
      inventoryNumber: printer.inventoryNumber,
      brand: printer.brand,
      type: printer.type,
      serialNumber: printer.serialNumber,
      locationId: printer.locationId,
      manufacturer: printer.manufacturer,
      active: printer.active,
    });
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.editingPrinterId = null;
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || this.editSubmitting() || !this.editingPrinterId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editSubmitting.set(true);
    this.editErrorMessage.set(null);

    this.updatePrinterUseCase.execute(this.editingPrinterId, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.editSubmitting.set(false);
        this.showEditDialog.set(false);
        this.editingPrinterId = null;
      },
      error: () => {
        this.editSubmitting.set(false);
        this.editErrorMessage.set('No se pudo actualizar la impresora. Intenta nuevamente.');
      },
    });
  }
}
