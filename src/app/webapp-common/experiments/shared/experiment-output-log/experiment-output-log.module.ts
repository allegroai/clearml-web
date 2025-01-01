import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExperimentOutputLogComponent} from '../../containers/experiment-output-log/experiment-output-log.component';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {PushPipe} from '@ngrx/component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';



@NgModule({
  declarations: [ExperimentOutputLogComponent, ExperimentLogInfoComponent],
  exports: [ExperimentOutputLogComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    ExperimentSharedModule,
    SaferPipe,
    PushPipe,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput
  ]
})
export class ExperimentOutputLogModule { }
