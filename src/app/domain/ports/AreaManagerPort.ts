import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AreaManager, NewAreaManager } from '../models/AreaManager';

export interface AreaManagerPort {
  list(): Observable<AreaManager[]>;
  create(areaManager: NewAreaManager): Observable<AreaManager>;
  updateStatus(areaManager: AreaManager, active: boolean): Observable<AreaManager>;
}

export const AREA_MANAGER_PORT = new InjectionToken<AreaManagerPort>('AREA_MANAGER_PORT');
