import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-assets-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './AssetsLayoutPage.html',
  styleUrl: './AssetsLayoutPage.css',
})
export class AssetsLayoutPage {
  private readonly router = inject(Router);

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
