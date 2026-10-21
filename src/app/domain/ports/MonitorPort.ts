import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Monitor, NewMonitor } from '../models/Monitor';

export interface MonitorPort {
  list(): Observable<Monitor[]>;
  create(input: NewMonitor): Observable<Monitor>;
  update(id: string, changes: NewMonitor): Observable<Monitor>;
}

export const MONITOR_PORT = new InjectionToken<MonitorPort>('MONITOR_PORT');
