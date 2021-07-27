import {Actions} from '@ngrx/effects';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AdminService} from '../admin/admin.service';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {DeleteDialogEffectsBase} from '../../webapp-common/shared/entity-page/entity-delete/base-delete-dialog.effects';
import {ConfigurationService} from '../../webapp-common/shared/services/configuration.service';


@Injectable()
export class DeleteDialogEffects extends DeleteDialogEffectsBase {
  constructor(actions$: Actions,
              store: Store<any>,
              tasksApi: ApiTasksService,
              modelsApi: ApiModelsService,
              projectsApi: ApiProjectsService,
              adminService: AdminService,
              configService: ConfigurationService) {
    super(actions$, store, tasksApi, modelsApi, projectsApi, adminService, configService);
  }
  // (Nir) don't delete this. Other repositories need to override some base functions.
}
