import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentHyperParamsInfoData, selectIsExperimentSaving, selectIsSelectedExperimentInDev} from '../../reducers';
import {ICommonExperimentInfoState} from '../../reducers/common-experiment-info.reducer';
import * as infoActions from '../../../../features/experiments/actions/experiments-info.actions';
import {ExperimentDataUpdated, SetExperimentFormErrors} from '../../../../features/experiments/actions/experiments-info.actions';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {selectBackdropActive} from '../../../core/reducers/view-reducer';
import {Observable, Subscription} from 'rxjs';
import {IHyperParamsForm} from '../../shared/experiment-hyper-params.model';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {cloneDeep} from 'lodash/fp';

@Component({
  selector   : 'sm-experiment-info-hyper-parameters',
  templateUrl: './experiment-info-hyper-parameters.component.html',
  styleUrls  : ['./experiment-info-hyper-parameters.component.scss']
})
export class ExperimentInfoHyperParametersComponent implements OnInit, OnDestroy {

  public hyperParamsInfo$: Observable<IHyperParamsForm>;
  // public errors$: Observable<IExecutionForm>;
  public selectedExperimentSbscrition: Subscription;
  private selectedExperiment: ISelectedExperiment;
  public editable$: Observable<boolean>;
  public isInDev$: Observable<boolean>;
  public saving$: Observable<boolean>;
  public backdropActive$: Observable<boolean>;
  private selectedExperimentSubscrition: Subscription;

  constructor(private store: Store<ICommonExperimentInfoState>) {
    this.hyperParamsInfo$ = this.store.select(selectExperimentHyperParamsInfoData);
    this.editable$        = this.store.select(selectIsExperimentEditable);
    this.isInDev$         = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$          = this.store.select(selectIsExperimentSaving);
    this.backdropActive$  = this.store.select(selectBackdropActive);
  }

  ngOnInit() {
    this.selectedExperimentSubscrition = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.store.dispatch(new SetExperimentFormErrors(null));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscrition.unsubscribe();
  }

  onFormValuesChanged(event) {
    this.store.dispatch(new ExperimentDataUpdated({id: this.selectedExperiment.id, changes: {[event.field]: cloneDeep(event.value)}}));
  }

  saveHyperParametersData() {
    this.store.dispatch(new infoActions.SaveExperiment());
    this.store.dispatch(new infoActions.DeactivateEdit());
  }

  cancelHyperParametersChange() {
    this.store.dispatch(new infoActions.DeactivateEdit());
    this.store.dispatch(new infoActions.CancelExperimentEdit());
  }

  activateEditChanged(e) {
    this.store.dispatch(new infoActions.ActivateEdit(e.sectionName));
  }

  // onFormErrorsChanged($event) {
  //
  // }

}
