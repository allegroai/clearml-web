import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const extCoreModules = [
  StoreDevtoolsModule.instrument({
    maxAge: 100,
    trace: true,
    traceLimit: 50,
    connectInZone: true
  })
];
