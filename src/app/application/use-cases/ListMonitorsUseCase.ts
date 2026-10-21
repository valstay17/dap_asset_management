import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MONITOR_PORT, MonitorPort } from '../../domain/ports/MonitorPort';
import { Monitor } from '../../domain/models/Monitor';
import { MonitorStore } from '../MonitorStore';

@Injectable({ providedIn: 'root' })
export class ListMonitorsUseCase {
  constructor(
    @Inject(MONITOR_PORT) private readonly monitorPort: MonitorPort,
    private readonly monitorStore: MonitorStore,
  ) {}

  execute(): Observable<Monitor[]> {
    return this.monitorPort.list().pipe(tap((monitors) => this.monitorStore.setMonitors(monitors)));
  }
}
