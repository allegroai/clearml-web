import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {SmSyncStateSelectorService} from '../../webapp-common/core/services/sync-state-selector.service';
import {BaseAdminService} from '../../webapp-common/admin/base-admin.service';

@Injectable()
export class AdminService extends BaseAdminService {

  constructor(protected store: Store<any>, public syncSelector: SmSyncStateSelectorService) {
    super(store, syncSelector);
  }
}
