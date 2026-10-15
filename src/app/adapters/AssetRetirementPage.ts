import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { ListAssetsUseCase } from '../application/use-cases/ListAssetsUseCase';
import { ListRetiredAssetsUseCase } from '../application/use-cases/ListRetiredAssetsUseCase';
import { RetireAssetUseCase } from '../application/use-cases/RetireAssetUseCase';
import { GenerateRetiredAssetsExcelUseCase } from '../application/use-cases/GenerateRetiredAssetsExcelUseCase';
import { AssetStore } from '../application/AssetStore';
import { Asset } from '../domain/models/Asset';

function matchesSearch(asset: Asset, search: string): boolean {
  if (!search) {
    return true;
  }
  return [asset.name, asset.user, asset.serialNumber, asset.inventoryNumber].some((value) =>
    value.toLowerCase().includes(search),
  );
}

@Component({
  selector: 'app-asset-retirement-page',
  imports: [
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    ConfirmDialogModule,
    MessageModule,
    DatePipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './AssetRetirementPage.html',
  styleUrl: './AssetRetirementPage.css',
})
export class AssetRetirementPage implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly listAssetsUseCase = inject(ListAssetsUseCase);
  private readonly listRetiredAssetsUseCase = inject(ListRetiredAssetsUseCase);
  private readonly retireAssetUseCase = inject(RetireAssetUseCase);
  private readonly generateRetiredAssetsExcelUseCase = inject(GenerateRetiredAssetsExcelUseCase);
  private readonly assetStore = inject(AssetStore);

  readonly loadingAssets = signal(true);
  readonly loadingRetired = signal(true);
  readonly generatingExcel = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly activeSearch = signal('');
  readonly retiredSearch = signal('');

  readonly retiringIds = signal<Set<string>>(new Set());

  readonly retiredTotal = computed(() => this.assetStore.retiredAssets().length);

  readonly filteredActiveAssets = computed(() => {
    const search = this.activeSearch().trim().toLowerCase();
    return this.assetStore
      .assets()
      .filter((asset) => matchesSearch(asset, search))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly sortedRetiredAssets = computed(() =>
    [...this.assetStore.retiredAssets()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );

  readonly filteredRetiredAssets = computed(() => {
    const search = this.retiredSearch().trim().toLowerCase();
    return this.sortedRetiredAssets().filter((asset) => matchesSearch(asset, search));
  });

  ngOnInit(): void {
    this.listAssetsUseCase.execute().subscribe({
      next: () => this.loadingAssets.set(false),
      error: () => this.loadingAssets.set(false),
    });
    this.listRetiredAssetsUseCase.execute().subscribe({
      next: () => this.loadingRetired.set(false),
      error: () => this.loadingRetired.set(false),
    });
  }

  confirmRetire(asset: Asset): void {
    this.confirmationService.confirm({
      header: 'Dar de baja equipo',
      message: `¿Deseas dar de baja el equipo "${asset.name}"? Dejará de aparecer en la consulta de equipos activos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Dar de baja',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.retireAsset(asset),
    });
  }

  async exportarExcel(): Promise<void> {
    if (this.generatingExcel()) {
      return;
    }

    this.generatingExcel.set(true);
    try {
      const excelBytes = this.generateRetiredAssetsExcelUseCase.execute(this.sortedRetiredAssets());
      const blob = new Blob([excelBytes as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bajas-de-equipos.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      this.generatingExcel.set(false);
    }
  }

  private retireAsset(asset: Asset): void {
    this.errorMessage.set(null);
    this.retiringIds.update((ids) => new Set(ids).add(asset.id));

    const done = () =>
      this.retiringIds.update((ids) => {
        const next = new Set(ids);
        next.delete(asset.id);
        return next;
      });

    this.retireAssetUseCase.execute(asset).subscribe({
      next: done,
      error: () => {
        done();
        this.errorMessage.set(`No se pudo dar de baja el equipo "${asset.name}". Intenta nuevamente.`);
      },
    });
  }
}
