import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {EffectsModule} from '@ngrx/effects';
import {AppEffects} from './app.effects';
import {StoreModule} from '@ngrx/store';
import {appReducer} from './app.reducer';
import {HttpClientModule} from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {ChooseColorModule} from '@common/shared/ui-components/directives/choose-color/choose-color.module';
import {SingleGraphModule} from '@common/shared/single-graph/single-graph.module';
import {DebugSampleModule} from '@common/shared/debug-sample/debug-sample.module';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {ApiReportsService} from '~/business-logic/api-services/reports.service';
import {BaseAdminService} from '@common/settings/admin/base-admin.service';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {authReducer} from '~/features/settings/containers/admin/auth.reducers';
import {extCoreModules} from '~/build-specifics';
import {SmApiRequestsService} from '~/business-logic/api-services/api-requests.service';

if (!localStorage.getItem('_saved_state_')) {
  localStorage.setItem('_saved_state_', '{}');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    MatDialogModule,
    ChooseColorModule,
    SingleGraphModule,
    DebugSampleModule,
    StoreModule.forRoot({appReducer, auth: authReducer}),
    EffectsModule.forRoot([AppEffects]),
    ...extCoreModules
  ],
  providers: [ApiEventsService, ApiReportsService, SmApiRequestsService, ColorHashService, BaseAdminService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
