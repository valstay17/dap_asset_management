import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ListAssetTypesUseCase } from '../application/use-cases/ListAssetTypesUseCase';
import { CreateAssetTypeUseCase } from '../application/use-cases/CreateAssetTypeUseCase';
import { AssetTypeStore } from '../application/AssetTypeStore';
import { NewAssetType } from '../domain/models/AssetType';

@Component({
  selector: 'app-asset-type-page',
  imports: [ReactiveFormsModule, ButtonModule, TableModule, DialogModule, InputTextModule, MessageModule],
  templateUrl: './AssetTypePage.html',
  styleUrl: './AssetTypePage.css',
})
export class AssetTypePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listAssetTypesUseCase = inject(ListAssetTypesUseCase);
  private readonly createAssetTypeUseCase = inject(CreateAssetTypeUseCase);
  private readonly assetTypeStore = inject(AssetTypeStore);

  readonly assetTypes = this.assetTypeStore.assetTypes;

  readonly loading = signal(true);
  readonly showCreateDialog = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
    this.form.reset({ name: '' });
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

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload: NewAssetType = this.form.getRawValue();

    this.createAssetTypeUseCase.execute(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateDialog.set(false);
        this.form.reset({ name: '' });
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No se pudo registrar el tipo. Intenta nuevamente.');
      },
    });
  }
}
