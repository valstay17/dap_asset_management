import { Component, HostListener, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { Popover } from 'primeng/popover';
import { SessionStore } from '../application/SessionStore';

@Component({
  selector: 'app-dashboard-page',
  imports: [ButtonModule, CardModule, ToolbarModule, AvatarModule, Popover],
  templateUrl: './DashboardPage.html',
  styleUrl: './DashboardPage.css',
})
export class DashboardPage {
  private readonly router = inject(Router);
  private readonly sessionStore = inject(SessionStore);

  isScrolled = false;

  readonly user = computed(() => this.sessionStore.session()?.user ?? null);

  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  readonly cards = [
    { icon: 'inventory_2',  title: 'Captura de Bienes Informáticos', description: 'Registro y alta de nuevos equipos tecnológicos en el inventario global de la institución.',   route: '/capture/captura'},
    { icon: 'search_check', title: 'Consulta de Equipos',            description: 'Búsqueda avanzada y visualización técnica detallada de todo el parque informático activo.',     route: '/capture/consulta'},
    { icon: 'group_add',    title: 'Registro de Usuarios',           description: 'Administración de perfiles, permisos y acceso del personal técnico al ecosistema digital.',      route: '/capture/usuarios'},
    { icon: 'badge',        title: 'Jefes de Área',                  description: 'Administración de responsables por entidad autorizados para el resguardo de equipos.',         route: '/capture/jefes-area'},
    { icon: 'apartment',    title: 'Entidades',                      description: 'Gestión jerárquica de dependencias, departamentos y centros operativos autorizados.',             route: '/capture/entidades'},
    { icon: 'distance',     title: 'Ubicaciones',                    description: 'Control geográfico y georreferenciación de activos distribuidos en la red territorial.',          route: '/capture/ubicaciones'},
    { icon: 'picture_as_pdf', title: 'Registro',                     description: 'Generación de registros en PDF de los bienes asignados, filtrados por usuario.',                   route: '/capture/registro'},
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }

  logout(): void {
    this.sessionStore.clearSession();
    this.router.navigateByUrl('/login');
  }
}
