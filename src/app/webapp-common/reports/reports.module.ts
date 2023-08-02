import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../shared/shared.module';
import {EffectsModule} from '@ngrx/effects';
import {CommonLayoutModule} from '../layout/layout.module';
import {SharedModule} from '~/shared/shared.module';
import {ReportsEffects} from './reports.effects';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {ActionReducer, StoreConfig, StoreModule} from '@ngrx/store';
import {REPORTS_KEY, reportsReducer, ReportsState} from './reports.reducer';
import {ReportsRoutingModule} from './reports-routing.module';
import {ReportsListComponent} from './reports-list/reports-list.component';
import {ReportsHeaderComponent} from './reports-filters/reports-header.component';
import {UiComponentsModule} from '../shared/ui-components/ui-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMMaterialModule} from '../shared/material/material.module';
import {ReportDialogComponent} from './report-dialog/report-dialog.component';
import {CreateNewReportFormComponent} from './report-dialog/create-new-report-form/create-new-report-form.component';
import {ReportComponent} from './report/report.component';
import {NgxPrintModule} from 'ngx-print';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ReportsSharedModule} from '@common/reports/reports-shared.module';
import {ExistNameValidatorDirective} from '@common/shared/ui-components/template-forms-ui/exist-name-validator.directive';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {UserPreferences} from '@common/user-preferences';
import {createUserPrefFeatureReducer} from '@common/core/meta-reducers/user-pref-reducer';
import {REPORTS_PREFIX} from '@common/reports/reports.actions';


const reportsSyncedKeys = ['orderBy', 'sortOrder'];
export const REPORTS_STORE_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<ReportsState, any>>('DatasetsConfigToken');

const getInitState = (userPreferences: UserPreferences) => ({
  metaReducers: [
    (reducer: ActionReducer<any>) =>
      createUserPrefFeatureReducer(REPORTS_KEY, reportsSyncedKeys, [REPORTS_PREFIX], userPreferences, reducer),
  ]
});
@NgModule({
  imports: [
    UiComponentsModule,
    CommonModule,
    SMSharedModule,
    FormsModule,
    ReactiveFormsModule,
    SMMaterialModule,
    EffectsModule.forFeature([ReportsEffects]),
    StoreModule.forFeature(REPORTS_KEY, reportsReducer, REPORTS_STORE_CONFIG_TOKEN),
    SharedModule,
    CommonLayoutModule,
    ReportsRoutingModule,
    NgxPrintModule,
    ScrollingModule,
    ReportsSharedModule,
    ExistNameValidatorDirective,
    SharedPipesModule,
    MatProgressSpinnerModule,
    LabeledFormFieldDirective,
  ],
  declarations: [ReportsPageComponent, ReportsListComponent, ReportsHeaderComponent, ReportDialogComponent,
    CreateNewReportFormComponent, ReportComponent],
  exports: [],
  providers: [
    {provide: REPORTS_STORE_CONFIG_TOKEN, useFactory: getInitState, deps: [UserPreferences]},
  ],
})
export class ReportsModule {
}
