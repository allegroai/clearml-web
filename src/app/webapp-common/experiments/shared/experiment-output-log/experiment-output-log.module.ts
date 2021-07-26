import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExperimentOutputLogComponent} from '../../containers/experiment-output-log/experiment-output-log.component';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import {SMSharedModule} from '../../../shared/shared.module';
import {UiComponentsModule} from '../../../shared/ui-components/ui-components.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {SharedPipesModule} from '../../../shared/pipes/shared-pipes.module';



@NgModule({
  declarations: [ExperimentOutputLogComponent, ExperimentLogInfoComponent],
  exports: [ExperimentOutputLogComponent],
  imports: [
    CommonModule,
    SMSharedModule,
    MatProgressSpinnerModule,
    UiComponentsModule,
    SharedPipesModule
  ]
})
export class ExperimentOutputLogModule { }
