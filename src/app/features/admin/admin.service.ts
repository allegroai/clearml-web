import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {SmSyncStateSelectorService} from '../../webapp-common/core/services/sync-state-selector.service';
import {BaseAdminService} from '../../webapp-common/admin/base-admin.service';
import {ConfigurationService} from '../../webapp-common/shared/services/configuration.service';

@Injectable()
export class AdminService extends BaseAdminService {

  constructor(store: Store<any>, protected syncSelector: SmSyncStateSelectorService, protected confService: ConfigurationService) {
    super(store, syncSelector, confService);
  }
}
