import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '@common/shared/shared.module';
import {SharedModule} from '~/shared/shared.module';
import {ReportCardComponent} from '@common/reports/report-card/report-card.component';
import {ReportCardMenuComponent} from '@common/reports/report-card-menu/report-card-menu.component';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';

const declarations = [  ReportCardComponent,
  ReportCardMenuComponent,];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMSharedModule,
    SharedModule,
    SharedPipesModule,
    ExperimentSharedModule,
    LabeledFormFieldDirective
  ],
  declarations: [...declarations],
  exports: [...declarations],
  providers: []
})

export class ReportsSharedModule {
}
