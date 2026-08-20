import { Routes } from '@angular/router';
import { authGuard } from './infrastructure/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./adapters/LoginPage').then((m) => m.LoginPage) },
  {
    path: 'dashboard',
    loadComponent: () => import('./adapters/DashboardPage').then((m) => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'capture',
    loadComponent: () => import('./adapters/AssetsLayoutPage').then((m) => m.AssetsLayoutPage),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      { path: 'captura', loadComponent: () => import('./adapters/AssetCapturePage').then((m) => m.AssetCapturePage) },
      { path: 'consulta', loadComponent: () => import('./adapters/AssetConsultationPage').then((m) => m.AssetConsultationPage) },
      { path: 'usuarios', loadComponent: () => import('./adapters/RegisteredUserPage').then((m) => m.RegisteredUserPage) },
      { path: 'entidades', loadComponent: () => import('./adapters/EntityPage').then((m) => m.EntityPage) },
      { path: 'ubicaciones', loadComponent: () => import('./adapters/LocationPage').then((m) => m.LocationPage) },
      { path: 'registro', loadComponent: () => import('./adapters/ReportPage').then((m) => m.ReportPage) },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
