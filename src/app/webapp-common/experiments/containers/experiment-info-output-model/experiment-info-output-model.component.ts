import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentInfoErrors, selectExperimentModelInfoData, selectExperimentUserKnowledge, selectIsExperimentSaving} from '../../reducers';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {createModelLink} from '../../../shared/utils/shared-utils';
import {SmSyncStateSelectorService} from '../../../core/services/sync-state-selector.service';
import {Model} from '../../../../business-logic/model/models/model';
import {Observable, Subscription} from 'rxjs';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../../../../features/experiments/shared/experiments.const';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import * as infoActions from '../../../../features/experiments/actions/experiments-info.actions';
import * as commonInfoActions from '../../../../webapp-common/experiments/actions/common-experiments-info.actions';
import {AdminService} from '../../../../features/admin/admin.service';
import {resetDontShowAgainForBucketEndpoint} from '../../../core/actions/common-auth.actions';

@Component({
  selector: 'sm-experiment-info-output-model',
  templateUrl: './experiment-info-output-model.component.html',
  styleUrls: ['./experiment-info-output-model.component.scss']
})
export class ExperimentInfoOutputModelComponent implements OnInit, OnDestroy {
  public modelInfo$: Observable<IExperimentModelInfo>;
  public selectedExperimentSubscription: Subscription;
  public editable$: Observable<boolean>;
  public errors$: Observable<IExperimentInfoState['errors']>;
  public userKnowledge$: Observable<Map<experimentSectionsEnum, boolean>>;
  public modelLabels$: Observable<Model['labels']>;
  public saving$: Observable<boolean>;
  private selectedExperiment: ISelectedExperiment;

  constructor(private store: Store<IExperimentInfoState>,
              private syncSelector: SmSyncStateSelectorService,
              private adminService: AdminService
  ) {
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.errors$ = this.store.select(selectExperimentInfoErrors);
    this.userKnowledge$ = this.store.select(selectExperimentUserKnowledge);
    this.saving$ = this.store.select(selectIsExperimentSaving);
  }

  ngOnInit() {
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.store.dispatch(new infoActions.SetExperimentFormErrors(null));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription.unsubscribe();
  }

  onFormValuesChanged(event: { field: string, value: any }) {
    this.store.dispatch(new infoActions.ExperimentDataUpdated({id: this.selectedExperiment.id, changes: {[event.field]: event.value}}));
  }

  onFormErrorsChanged(event: { field: string, errors: any }) {
    this.store.dispatch(new infoActions.SetExperimentErrors({[event.field]: event.errors}));
  }

  showModel() {
    this.store.dispatch(resetDontShowAgainForBucketEndpoint());
    const selectedModel = this.syncSelector.selectSync(selectExperimentModelInfoData).input;
    const modelSignedUri = this.adminService.signUrlIfNeeded(selectedModel.url);
    if (modelSignedUri) {
      window.open(createModelLink(selectedModel.url, selectedModel.id, modelSignedUri));
    }
  }

  onModelSelected(event) {
    this.store.dispatch(new commonInfoActions.ModelSelected(event));
  }

  updateSectionKnowledge(section: experimentSectionsEnum) {
    this.store.dispatch(new infoActions.UpdateSectionKnowledge(section));
  }

  saveModelData() {
    this.store.dispatch(new infoActions.SaveExperiment());
    this.store.dispatch(new infoActions.DeactivateEdit());

  }

  cancelModelChange() {
    this.store.dispatch(new infoActions.DeactivateEdit());
    this.store.dispatch(new infoActions.CancelExperimentEdit());
  }

  activateEditChanged(e) {
    this.store.dispatch(new infoActions.ActivateEdit(e.sectionName));
  }
}
