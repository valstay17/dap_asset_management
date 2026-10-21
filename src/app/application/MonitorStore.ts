import { Injectable, signal } from '@angular/core';
import { Monitor } from '../domain/models/Monitor';

@Injectable({ providedIn: 'root' })
export class MonitorStore {
  private readonly monitorsState = signal<Monitor[]>([]);

  readonly monitors = this.monitorsState.asReadonly();

  setMonitors(monitors: Monitor[]): void {
    this.monitorsState.set(monitors);
  }

  addMonitor(monitor: Monitor): void {
    this.monitorsState.update((monitors) => [monitor, ...monitors]);
  }

  updateMonitor(monitor: Monitor): void {
    this.monitorsState.update((monitors) =>
      monitors.map((existing) => (existing.id === monitor.id ? monitor : existing)),
    );
  }
}
