import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MONITOR_PORT, MonitorPort } from '../../domain/ports/MonitorPort';
import { Monitor, NewMonitor } from '../../domain/models/Monitor';
import { MonitorStore } from '../MonitorStore';

@Injectable({ providedIn: 'root' })
export class UpdateMonitorUseCase {
  constructor(
    @Inject(MONITOR_PORT) private readonly monitorPort: MonitorPort,
    private readonly monitorStore: MonitorStore,
  ) {}

  execute(id: string, changes: NewMonitor): Observable<Monitor> {
    return this.monitorPort.update(id, changes).pipe(tap((monitor) => this.monitorStore.updateMonitor(monitor)));
  }
}
