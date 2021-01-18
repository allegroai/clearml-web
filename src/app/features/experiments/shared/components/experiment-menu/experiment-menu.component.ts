import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {BlTasksService} from '../../../../../business-logic/services/tasks.service';
import {SmSyncStateSelectorService} from '../../../../../webapp-common/core/services/sync-state-selector.service';
import {BaseExperimentMenuComponent} from '../../../../../webapp-common/experiments/shared/components/base-experiment-menu';
import {isReadOnly} from '../../../../../webapp-common/shared/utils/shared-utils';
import {IExperimentInfoState} from '../../../reducers/experiment-info.reducer';

@Component({
  selector   : 'sm-experiment-menu',
  templateUrl: './experiment-menu.component.html',
  styleUrls  : ['./experiment-menu.component.scss']
})
export class ExperimentMenuComponent extends BaseExperimentMenuComponent {

  @Input() set experiment(experiment) {
    this._experiment = experiment;
    this.isExample   = isReadOnly(experiment);
  }

  get experiment() {
    return this._experiment;
  }

  @Input() selectedExperiment;
  @Input() isSharedAndNotOwner;
  @Input() tagsFilterByProject: boolean;

  constructor(
    protected blTaskService: BlTasksService,
    protected dialog: MatDialog,
    protected router: Router,
    protected store: Store<IExperimentInfoState>,
    protected syncSelector: SmSyncStateSelectorService,
    protected eRef: ElementRef,
    protected route: ActivatedRoute
  ) {
    super(blTaskService, dialog, router, store, syncSelector, eRef, route);
  }


}
