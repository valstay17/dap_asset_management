import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AreaManager, NewAreaManager } from '../models/AreaManager';

export interface AreaManagerPort {
  list(): Observable<AreaManager[]>;
  create(areaManager: NewAreaManager): Observable<AreaManager>;
}

export const AREA_MANAGER_PORT = new InjectionToken<AreaManagerPort>('AREA_MANAGER_PORT');
