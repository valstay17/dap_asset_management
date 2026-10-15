import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ListAssetTypesUseCase } from '../application/use-cases/ListAssetTypesUseCase';
import { CreateAssetTypeUseCase } from '../application/use-cases/CreateAssetTypeUseCase';
import { AssetTypeStore } from '../application/AssetTypeStore';
import { AssetType, NewAssetType } from '../domain/models/AssetType';

@Component({
  selector: 'app-asset-type-page',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './AssetTypePage.html',
  styleUrl: './AssetTypePage.css',
})
export class AssetTypePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listAssetTypesUseCase = inject(ListAssetTypesUseCase);
  private readonly createAssetTypeUseCase = inject(CreateAssetTypeUseCase);
  private readonly assetTypeStore = inject(AssetTypeStore);
  private readonly confirmationService = inject(ConfirmationService);

  // Los tipos dados de baja se conservan en el store pero no se listan.
  readonly assetTypes = computed(() => this.assetTypeStore.assetTypes().filter((assetType) => assetType.active));

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingAssetType = signal<AssetType | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.listAssetTypesUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  isInvalid(controlName: 'name'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  openCreateDialog(): void {
    this.errorMessage.set(null);
    this.editingAssetType.set(null);
    this.form.reset({ name: '' });
    this.showCreateDialog.set(true);
  }

  openEditDialog(assetType: AssetType): void {
    this.errorMessage.set(null);
    this.editingAssetType.set(assetType);
    this.form.reset({ name: assetType.name });
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  confirmDelete(assetType: AssetType): void {
    this.confirmationService.confirm({
      header: 'Eliminar tipo',
      message: `¿Deseas eliminar el tipo "${assetType.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      // TODO: conectar con el endpoint de eliminación cuando esté disponible; por ahora solo afecta la vista.
      accept: () => this.assetTypeStore.deactivateAssetType(assetType.id),
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: NewAssetType = this.form.getRawValue();

    // TODO: conectar con el endpoint de actualización cuando esté disponible; por ahora solo afecta la vista.
    const editing = this.editingAssetType();
    if (editing) {
      this.assetTypeStore.updateAssetType({ ...editing, ...payload });
      this.closeAndResetForm();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.createAssetTypeUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAndResetForm();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar el tipo. Intenta nuevamente.');
      },
    });
  }

  private closeAndResetForm(): void {
    this.showCreateDialog.set(false);
    this.editingAssetType.set(null);
    this.form.reset({ name: '' });
  }
}
