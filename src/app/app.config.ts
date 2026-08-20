import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { AUTH_PORT } from './domain/ports/AuthPort';
import { MockAuthAdapter } from './infrastructure/auth/MockAuthAdapter';
import { ASSET_PORT } from './domain/ports/AssetPort';
import { MockAssetAdapter } from './infrastructure/assets/MockAssetAdapter';
import { USER_PORT } from './domain/ports/UserPort';
import { MockUserAdapter } from './infrastructure/users/MockUserAdapter';
import { ENTITY_PORT } from './domain/ports/EntityPort';
import { MockEntityAdapter } from './infrastructure/entities/MockEntityAdapter';
import { LOCATION_PORT } from './domain/ports/LocationPort';
import { MockLocationAdapter } from './infrastructure/locations/MockLocationAdapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({ theme: { preset: Aura } }),
    { provide: AUTH_PORT, useClass: MockAuthAdapter },
    { provide: ASSET_PORT, useClass: MockAssetAdapter },
    { provide: USER_PORT, useClass: MockUserAdapter },
    { provide: ENTITY_PORT, useClass: MockEntityAdapter },
    { provide: LOCATION_PORT, useClass: MockLocationAdapter },
  ]
};
