import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MONITOR_PORT, MonitorPort } from '../../domain/ports/MonitorPort';
import { Monitor, NewMonitor } from '../../domain/models/Monitor';

@Injectable({ providedIn: 'root' })
export class CreateMonitorUseCase {
  constructor(@Inject(MONITOR_PORT) private readonly monitorPort: MonitorPort) {}

  execute(input: NewMonitor): Observable<Monitor> {
    return this.monitorPort.create(input);
  }
}
