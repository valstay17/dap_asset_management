import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Monitor, NewMonitor } from '../models/Monitor';

export interface MonitorPort {
  create(input: NewMonitor): Observable<Monitor>;
}

export const MONITOR_PORT = new InjectionToken<MonitorPort>('MONITOR_PORT');
