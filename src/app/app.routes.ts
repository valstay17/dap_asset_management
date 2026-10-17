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
      { path: 'telefonos', loadComponent: () => import('./adapters/PhoneCapturePage').then((m) => m.PhoneCapturePage) },
      { path: 'monitores', loadComponent: () => import('./adapters/MonitorCapturePage').then((m) => m.MonitorCapturePage) },
      { path: 'impresoras', loadComponent: () => import('./adapters/PrinterCapturePage').then((m) => m.PrinterCapturePage) },
      { path: 'consulta', loadComponent: () => import('./adapters/AssetConsultationPage').then((m) => m.AssetConsultationPage) },
      { path: 'usuarios', loadComponent: () => import('./adapters/RegisteredUserPage').then((m) => m.RegisteredUserPage) },
      { path: 'jefes-area', loadComponent: () => import('./adapters/AreaManagerPage').then((m) => m.AreaManagerPage) },
      { path: 'entidades', loadComponent: () => import('./adapters/EntityPage').then((m) => m.EntityPage) },
      { path: 'ubicaciones', loadComponent: () => import('./adapters/LocationPage').then((m) => m.LocationPage) },
      { path: 'tipos', loadComponent: () => import('./adapters/AssetTypePage').then((m) => m.AssetTypePage) },
      { path: 'bajas', loadComponent: () => import('./adapters/AssetRetirementPage').then((m) => m.AssetRetirementPage) },
      { path: 'registro', loadComponent: () => import('./adapters/ReportPage').then((m) => m.ReportPage) },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
