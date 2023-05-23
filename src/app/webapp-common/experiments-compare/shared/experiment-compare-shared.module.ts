import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentSettingsComponent} from '../../shared/components/experiment-settings/experiment-settings';
import {SMSharedModule} from '../../shared/shared.module';
import {
  SelectMetricForCustomColComponent
} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

const declarations = [
  ExperimentSettingsComponent,
  SelectMetricForCustomColComponent,
];

@NgModule({
    imports: [
        CommonModule,
        SMSharedModule,
        MatRadioModule,
        FormsModule,
        SharedPipesModule,
        MatProgressSpinnerModule
    ],
  declarations   : [declarations],
  exports        : [...declarations]
})
export class ExperimentCompareSharedModule {
}
