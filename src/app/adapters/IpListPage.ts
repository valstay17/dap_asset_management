import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ListAssetsUseCase } from '../application/use-cases/ListAssetsUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { GenerateIpListExcelUseCase } from '../application/use-cases/GenerateIpListExcelUseCase';
import { AssetStore } from '../application/AssetStore';
import { LocationStore } from '../application/LocationStore';
import { Asset } from '../domain/models/Asset';
import { formatBuildingLabel, formatLocationLabel } from '../domain/models/SiteLocation';

function compareIpAddress(a: string, b: string): number {
  const octetsA = a.split('.').map(Number);
  const octetsB = b.split('.').map(Number);
  const length = Math.max(octetsA.length, octetsB.length);

  for (let i = 0; i < length; i++) {
    const diff = (octetsA[i] ?? 0) - (octetsB[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

@Component({
  selector: 'app-ip-list-page',
  imports: [TableModule, ButtonModule],
  templateUrl: './IpListPage.html',
  styleUrl: './IpListPage.css',
})
export class IpListPage implements OnInit {
  private readonly listAssetsUseCase = inject(ListAssetsUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly generateIpListExcelUseCase = inject(GenerateIpListExcelUseCase);
  private readonly assetStore = inject(AssetStore);
  private readonly locationStore = inject(LocationStore);

  readonly loading = signal(true);
  readonly generatingExcel = signal(false);

  readonly total = computed(() => this.sortedAssets().length);

  private readonly buildingLabelByLocation = computed(() => {
    const map = new Map<string, string>();
    this.locationStore.locations().forEach((location) => {
      map.set(formatLocationLabel(location), formatBuildingLabel(location));
    });
    return map;
  });

  readonly sortedAssets = computed<Asset[]>(() =>
    [...this.assetStore.assets()].sort((a, b) => compareIpAddress(a.networkAddress, b.networkAddress)),
  );

  buildingLabel(location: string): string {
    return this.buildingLabelByLocation().get(location) ?? location;
  }

  ngOnInit(): void {
    this.listAssetsUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listLocationsUseCase.execute().subscribe();
  }

  async exportarExcel(): Promise<void> {
    if (this.generatingExcel()) {
      return;
    }

    this.generatingExcel.set(true);
    try {
      const excelBytes = this.generateIpListExcelUseCase.execute(this.sortedAssets(), (location) =>
        this.buildingLabel(location),
      );
      const blob = new Blob([excelBytes as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lista-de-ips.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      this.generatingExcel.set(false);
    }
  }
}
