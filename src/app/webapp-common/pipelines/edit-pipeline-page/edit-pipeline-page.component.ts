import { Component, inject } from '@angular/core';
import { PipelineAddStepDialogComponent } from '../pipeline-add-step-dialog/pipeline-add-step-dialog.component';
import { PipelineSettingComponent } from '../pipeline-setting/pipeline-setting.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { createPipelineStep,settingsPipelineAction} from '../pipelines.actions';

@Component({
  selector: 'sm-edit-pipeline-page',
  templateUrl: './edit-pipeline-page.component.html',
  styleUrls: ['./edit-pipeline-page.component.scss']
})
export class EditPipelinePageComponent {
  protected dialog = inject(MatDialog);
  protected store = inject(Store);
  
  createPipeline() {

    this.dialog.open(PipelineAddStepDialogComponent, {
      data: {defaultExperimentId: ''},
      panelClass: 'light-theme',
      width: '640px'
    })
      .afterClosed()
      .subscribe(pipeline => {
        if (pipeline) {
          this.store.dispatch(createPipelineStep({pipelinesCreateStepRequest: pipeline}));
        }
      });

    // this.dialog.open(PipelineDialogComponent, {
    //   data: {
    //     panelClass: 'light-theme',
    //   },
    //   width: '640px'
    // });

  }
  settings() {
    this.dialog.open(PipelineSettingComponent, {
      data: {defaultExperimentId: ''},
      panelClass: 'light-theme',
      width: '640px'
    })
      .afterClosed()
      .subscribe(pipeline => {
        if (pipeline) {
          this.store.dispatch(settingsPipelineAction({pipelinesSettingsRequest: pipeline}));
        }
      });
  }

}
