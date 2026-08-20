import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ListAssetsUseCase } from '../application/use-cases/ListAssetsUseCase';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { ListLocationsUseCase } from '../application/use-cases/ListLocationsUseCase';
import { GenerateUserReportPdfUseCase } from '../application/use-cases/GenerateUserReportPdfUseCase';
import { AssetStore } from '../application/AssetStore';
import { UserStore } from '../application/UserStore';
import { User } from '../domain/models/User';

@Component({
  selector: 'app-report-page',
  imports: [FormsModule, ButtonModule, Select, MessageModule],
  templateUrl: './ReportPage.html',
  styleUrl: './ReportPage.css',
})
export class ReportPage implements OnInit {
  private readonly listAssetsUseCase = inject(ListAssetsUseCase);
  private readonly listUsersUseCase = inject(ListUsersUseCase);
  private readonly listLocationsUseCase = inject(ListLocationsUseCase);
  private readonly generateUserReportPdfUseCase = inject(GenerateUserReportPdfUseCase);
  private readonly assetStore = inject(AssetStore);
  private readonly userStore = inject(UserStore);

  readonly loading = signal(true);
  readonly generating = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly userOptions = computed(() =>
    this.userStore
      .users()
      .map((user) => ({ id: user.id, label: `${user.firstName} ${user.lastName}` }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  );

  readonly selectedUserId = signal<string | null>(null);

  readonly selectedUser = computed<User | null>(
    () => this.userStore.users().find((user) => user.id === this.selectedUserId()) ?? null,
  );

  readonly assignedAssets = computed(() => {
    const user = this.selectedUser();
    if (!user) {
      return [];
    }
    const fullName = `${user.firstName} ${user.lastName}`;
    return this.assetStore.assets().filter((asset) => asset.user === fullName);
  });

  ngOnInit(): void {
    this.listAssetsUseCase.execute().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.listUsersUseCase.execute().subscribe();
    this.listLocationsUseCase.execute().subscribe();
  }

  onUserChange(userId: string | null): void {
    this.selectedUserId.set(userId);
    this.errorMessage.set(null);
  }

  async generarRegistro(): Promise<void> {
    const user = this.selectedUser();
    if (!user || this.generating()) {
      return;
    }

    this.generating.set(true);
    this.errorMessage.set(null);

    try {
      const pdfBytes = await this.generateUserReportPdfUseCase.execute(user, this.assignedAssets());
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      this.errorMessage.set('No se pudo generar el registro. Intenta nuevamente.');
    } finally {
      this.generating.set(false);
    }
  }
}
