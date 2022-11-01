import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const extCoreModules = [
  StoreDevtoolsModule.instrument({
    maxAge: 50
  })
];
