import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { unauthorizedInterceptor } from './infrastructure/interceptors/unauthorized.interceptor';
import { AUTH_PORT } from './domain/ports/AuthPort';
import { HttpAuthAdapter } from './infrastructure/auth/HttpAuthAdapter';
import { ASSET_PORT } from './domain/ports/AssetPort';
import { HttpAssetAdapter } from './infrastructure/assets/HttpAssetAdapter';
import { USER_PORT } from './domain/ports/UserPort';
import { HttpUserAdapter } from './infrastructure/users/HttpUserAdapter';
import { ENTITY_PORT } from './domain/ports/EntityPort';
import { HttpEntityAdapter } from './infrastructure/entities/HttpEntityAdapter';
import { LOCATION_PORT } from './domain/ports/LocationPort';
import { HttpLocationAdapter } from './infrastructure/locations/HttpLocationAdapter';
import { ASSET_TYPE_PORT } from './domain/ports/AssetTypePort';
import { HttpAssetTypeAdapter } from './infrastructure/asset-types/HttpAssetTypeAdapter';
import { AREA_MANAGER_PORT } from './domain/ports/AreaManagerPort';
import { HttpAreaManagerAdapter } from './infrastructure/area-managers/HttpAreaManagerAdapter';
import { PHONE_PORT } from './domain/ports/PhonePort';
import { HttpPhoneAdapter } from './infrastructure/phones/HttpPhoneAdapter';
import { MONITOR_PORT } from './domain/ports/MonitorPort';
import { HttpMonitorAdapter } from './infrastructure/monitors/HttpMonitorAdapter';
import { PRINTER_PORT } from './domain/ports/PrinterPort';
import { HttpPrinterAdapter } from './infrastructure/printers/HttpPrinterAdapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([unauthorizedInterceptor])),
    provideRouter(routes),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: false } } }),
    { provide: AUTH_PORT, useClass: HttpAuthAdapter },
    { provide: ASSET_PORT, useClass: HttpAssetAdapter },
    { provide: USER_PORT, useClass: HttpUserAdapter },
    { provide: ENTITY_PORT, useClass: HttpEntityAdapter },
    { provide: LOCATION_PORT, useClass: HttpLocationAdapter },
    { provide: ASSET_TYPE_PORT, useClass: HttpAssetTypeAdapter },
    { provide: AREA_MANAGER_PORT, useClass: HttpAreaManagerAdapter },
    { provide: PHONE_PORT, useClass: HttpPhoneAdapter },
    { provide: MONITOR_PORT, useClass: HttpMonitorAdapter },
    { provide: PRINTER_PORT, useClass: HttpPrinterAdapter },
  ]
};
