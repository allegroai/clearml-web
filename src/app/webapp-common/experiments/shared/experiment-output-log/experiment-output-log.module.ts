import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExperimentOutputLogComponent} from '../../containers/experiment-output-log/experiment-output-log.component';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import {SMSharedModule} from '@common/shared/shared.module';
import {UiComponentsModule} from '@common/shared/ui-components/ui-components.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {ScrollingModule} from '@angular/cdk/scrolling';



@NgModule({
  declarations: [ExperimentOutputLogComponent, ExperimentLogInfoComponent],
  exports: [ExperimentOutputLogComponent],
  imports: [
    CommonModule,
    SMSharedModule,
    MatProgressSpinnerModule,
    UiComponentsModule,
    SharedPipesModule,
    ScrollingModule
  ]
})
export class ExperimentOutputLogModule { }
