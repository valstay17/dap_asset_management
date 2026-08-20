import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NewSiteLocation, SiteLocation } from '../models/SiteLocation';

export interface LocationPort {
  list(): Observable<SiteLocation[]>;
  create(location: NewSiteLocation): Observable<SiteLocation>;
}

export const LOCATION_PORT = new InjectionToken<LocationPort>('LOCATION_PORT');
