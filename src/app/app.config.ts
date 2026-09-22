import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { AUTH_PORT } from './domain/ports/AuthPort';
import { HttpAuthAdapter } from './infrastructure/auth/HttpAuthAdapter';
import { ASSET_PORT } from './domain/ports/AssetPort';
import { MockAssetAdapter } from './infrastructure/assets/MockAssetAdapter';
import { USER_PORT } from './domain/ports/UserPort';
import { MockUserAdapter } from './infrastructure/users/MockUserAdapter';
import { ENTITY_PORT } from './domain/ports/EntityPort';
import { MockEntityAdapter } from './infrastructure/entities/MockEntityAdapter';
import { LOCATION_PORT } from './domain/ports/LocationPort';
import { HttpLocationAdapter } from './infrastructure/locations/HttpLocationAdapter';
import { ASSET_TYPE_PORT } from './domain/ports/AssetTypePort';
import { MockAssetTypeAdapter } from './infrastructure/asset-types/MockAssetTypeAdapter';
import { AREA_MANAGER_PORT } from './domain/ports/AreaManagerPort';
import { MockAreaManagerAdapter } from './infrastructure/area-managers/MockAreaManagerAdapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: false } } }),
    { provide: AUTH_PORT, useClass: HttpAuthAdapter },
    { provide: ASSET_PORT, useClass: MockAssetAdapter },
    { provide: USER_PORT, useClass: MockUserAdapter },
    { provide: ENTITY_PORT, useClass: MockEntityAdapter },
    { provide: LOCATION_PORT, useClass: HttpLocationAdapter },
    { provide: ASSET_TYPE_PORT, useClass: MockAssetTypeAdapter },
    { provide: AREA_MANAGER_PORT, useClass: MockAreaManagerAdapter },
  ]
};
