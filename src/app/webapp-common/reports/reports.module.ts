import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../shared/shared.module';
import {EffectsModule} from '@ngrx/effects';
import {CommonLayoutModule} from '../layout/layout.module';
import {SharedModule} from '~/shared/shared.module';
import {ReportsEffects} from './reports.effects';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {StoreModule} from '@ngrx/store';
import {REPORTS_KEY, reportsReducer} from './reports.reducer';
import {ReportsRoutingModule} from './reports-routing.module';
import {ReportsListComponent} from './reports-list/reports-list.component';
import {ReportsHeaderComponent} from './reports-filters/reports-header.component';
import {UiComponentsModule} from '../shared/ui-components/ui-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMMaterialModule} from '../shared/material/material.module';
import {ReportDialogComponent} from './report-dialog/report-dialog.component';
import {CreateNewReportFormComponent} from './report-dialog/create-new-report-form/create-new-report-form.component';
import {ReportComponent} from './report/report.component';
import {CommonExperimentSharedModule} from '../experiments/shared/common-experiment-shared.module';
import {NgxPrintModule} from 'ngx-print';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ReportsSharedModule} from '@common/reports/reports-shared.module';
import {ExistNameValidatorDirective} from '@common/shared/ui-components/template-forms-ui/exist-name-validator.directive';

@NgModule({
  imports: [
    UiComponentsModule,
    CommonModule,
    SMSharedModule,
    FormsModule,
    ReactiveFormsModule,
    SMMaterialModule,
    EffectsModule.forFeature([ReportsEffects]),
    StoreModule.forFeature(REPORTS_KEY, reportsReducer),
    SharedModule,
    CommonExperimentSharedModule,
    CommonLayoutModule,
    ReportsRoutingModule,
    NgxPrintModule,
    ScrollingModule,
    ReportsSharedModule,
    ExistNameValidatorDirective
  ],
  declarations: [ReportsPageComponent, ReportsListComponent, ReportsHeaderComponent, ReportDialogComponent,
    CreateNewReportFormComponent, ReportComponent],
  exports: []
})
export class ReportsModule {
}
