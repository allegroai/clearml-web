import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '@common/shared/shared.module';
import {SharedModule} from '~/shared/shared.module';
import {ReportCardComponent} from '@common/reports/report-card/report-card.component';
import {ReportCardMenuComponent} from '@common/reports/report-card-menu/report-card-menu.component';
import {CommonExperimentSharedModule} from "@common/experiments/shared/common-experiment-shared.module";

const declarations = [  ReportCardComponent,
  ReportCardMenuComponent,];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMSharedModule,
    SharedModule,
    CommonExperimentSharedModule,
  ],
  declarations: [...declarations],
  exports: [...declarations],
  providers: []
})

export class ReportsSharedModule {
}
