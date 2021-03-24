import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../shared/shared.module';
import {ExperimentStatusIconLabelComponent} from './components/experiment-status-icon-label/experiment-status-icon-label.component';
import {ChangeProjectDialogComponent} from './components/change-project-dialog/change-project-dialog.component';
import {CommonExperimentConverterService} from './services/common-experiment-converter.service';
import {ExperimentSystemTagsComponent} from './components/experiments-system-tags/experiment-system-tags.component';
import {CloneDialogComponent} from './components/clone-dialog/clone-dialog.component';
import {SelectQueueModule} from './components/select-queue/select-queue.module';
import {FormsModule} from '@angular/forms';

const DECLARATIONS = [ExperimentStatusIconLabelComponent, ExperimentSystemTagsComponent, ChangeProjectDialogComponent, CloneDialogComponent];

@NgModule({
    imports: [
        SMSharedModule,
        CommonModule,
        SelectQueueModule,
        FormsModule,
    ],
  declarations   : [...DECLARATIONS],
  providers      : [CommonExperimentConverterService],
  exports        : [...DECLARATIONS]
})
export class CommonExperimentSharedModule {
}
