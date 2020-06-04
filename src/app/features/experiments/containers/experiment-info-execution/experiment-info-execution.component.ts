import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {IExecutionForm} from '../../shared/experiment-execution.model';
import {ISelectedExperiment} from '../../shared/experiment-info.model';
import {IExperimentInfoState} from '../../reducers/experiment-info.reducer';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../reducers';
import * as infoActions from '../../actions/experiments-info.actions';
import {selectExperimentExecutionInfoData, selectIsExperimentSaving, selectIsSelectedExperimentInDev} from '../../../../webapp-common/experiments/reducers';
import {selectBackdropActive} from '../../../../webapp-common/core/reducers/view-reducer';

@Component({
  selector   : 'sm-experiment-info-input-model',
  templateUrl: './experiment-info-execution.component.html',
  styleUrls  : ['./experiment-info-execution.component.scss']
})
export class ExperimentInfoExecutionComponent implements OnInit, OnDestroy {

  public executionInfo$: Observable<IExecutionForm>;
  public selectedExperimentSubscrition: Subscription;
  private selectedExperiment: ISelectedExperiment;
  public editable$: Observable<boolean>;
  public isInDev$: Observable<boolean>;
  public saving$: Observable<boolean>;
  public backdropActive$: Observable<boolean>;

  constructor(private store: Store<IExperimentInfoState>) {
    this.executionInfo$  = this.store.select(selectExperimentExecutionInfoData);
    this.editable$       = this.store.select(selectIsExperimentEditable);
    this.isInDev$        = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$         = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
  }

  ngOnInit() {
    this.selectedExperimentSubscrition = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.store.dispatch(new infoActions.SetExperimentFormErrors(null));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscrition.unsubscribe();
  }

  onFormValuesChanged(event) {
    this.store.dispatch(new infoActions.ExperimentDataUpdated({id: this.selectedExperiment.id, changes: {[event.field]: event.value}}));
  }

  saveExecutionData() {
    this.store.dispatch(new infoActions.SaveExperiment());
    this.store.dispatch(new infoActions.DeactivateEdit());
  }

  cancelExecutionData() {
    this.store.dispatch(new infoActions.DeactivateEdit());
    this.store.dispatch(new infoActions.CancelExperimentEdit());
  }

  activateEditChanged(e) {
    this.store.dispatch(new infoActions.ActivateEdit(e.sectionName));
  }

}
