import {Component, ElementRef} from '@angular/core';
import {ExperimentMenuComponent} from '@common/experiments/shared/components/experiment-menu/experiment-menu.component';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {selectionDisabledAbort, selectionDisabledContinue} from '@common/shared/entity-page/items.utils';
import * as commonMenuActions from '@common/experiments/actions/common-experiments-menu.actions';
import {RunPipelineControllerDialogComponent} from '../run-pipeline-controller-dialog/run-pipeline-controller-dialog.component';
import {filter} from 'rxjs/operators';
import {abortAllChildren} from '@common/experiments/actions/common-experiments-menu.actions';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';


@Component({
  selector: 'sm-controller-menu',
  templateUrl: './pipeline-controller-menu.component.html',
  styleUrls: ['./pipeline-controller-menu.component.scss']
})
export class PipelineControllerMenuComponent extends ExperimentMenuComponent {
  entityTypeEnum = EntityTypeEnum;

  constructor(
    protected blTaskService: BlTasksService,
    protected dialog: MatDialog,
    protected router: Router,
    protected store: Store<ExperimentInfoState>,
    protected syncSelector: SmSyncStateSelectorService,
    protected eRef: ElementRef,
    protected configService: ConfigurationService,
    protected route?: ActivatedRoute
  ) {
    super(blTaskService, dialog, router, store, syncSelector, eRef, configService, route);
  }

  runPipelineController(runNew: boolean = false) {
    const runPipelineDialog = this.dialog.open(RunPipelineControllerDialogComponent, {
      data: {task: runNew ? null : this._experiment}
    });
    runPipelineDialog.afterClosed().pipe(filter(res => !!res.confirmed)).subscribe((res) => {
      this.store.dispatch(commonMenuActions.startPipeline({
        task: res.task,
        args: res.args,
        queue: res.queue
      }));
    });
  }

  continueController() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledContinue(this.selectedExperiments).selectedFiltered : [this._experiment];

    this.store.dispatch(commonMenuActions.enqueueClicked({
      selectedEntities: selectedExperiments,
      queue: this._experiment.execution?.queue,
      verifyWatchers: false
    }));
  }

  abortControllerPopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledAbort(this.selectedExperiments).selectedFiltered : [this._experiment];
    this.store.dispatch(abortAllChildren({experiments: selectedExperiments}));
  }
}
