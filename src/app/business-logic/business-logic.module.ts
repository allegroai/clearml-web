import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiTasksService} from './api-services/tasks.service';
import {ApiModelsService} from './api-services/models.service';
import {ApiAuthService} from './api-services/auth.service';
import {ApiEventsService} from './api-services/events.service';
import {ApiProjectsService} from './api-services/projects.service';
import {ApiUsersService} from './api-services/users.service';
import {HttpClientModule} from '@angular/common/http';
import {SmApiRequestsService} from './api-services/api-requests.service';
import {BlTasksService} from './services/tasks.service';
import {BlModelsService} from './services/models.service';
import {ApiQueuesService} from './api-services/queues.service';
import {ApiWorkersService} from './api-services/workers.service';
import {ApiServerService} from './api-services/server.service';
import {ApiOrganizationService} from './api-services/organization.service';
import {ApiLoginService} from './api-services/login.service';
import {ApiPipelinesService} from '~/business-logic/api-services/pipelines.service';
import {ApiReportsService} from '~/business-logic/api-services/reports.service';

@NgModule({
  imports     : [CommonModule, HttpClientModule],
  declarations: [],
  exports     : [],
  providers   : [
    SmApiRequestsService,
    BlTasksService,
    BlModelsService,
    ApiTasksService,
    ApiQueuesService,
    ApiWorkersService,
    ApiAuthService,
    ApiModelsService,
    ApiEventsService,
    ApiProjectsService,
    ApiUsersService,
    ApiServerService,
    ApiOrganizationService,
    ApiLoginService,
    ApiPipelinesService,
    ApiReportsService,
  ]
})
export class BusinessLogicModule {
}
