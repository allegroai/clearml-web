import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {StorageGetSettingsResponse} from '~/business-logic/model/storage/storageGetSettingsResponse';


export const CredentialsSettingsActions = createActionGroup({
  source: 'Settings Credentials',
  events: {
    'get credentials': emptyProps(),
    'set credentials': props<{credentials: StorageGetSettingsResponse}>(),
    'update credentials': props<{credentials: StorageGetSettingsResponse}>()
  }
});
