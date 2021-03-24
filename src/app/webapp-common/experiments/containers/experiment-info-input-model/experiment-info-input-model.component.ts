import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentInfoErrors, selectExperimentModelInfoData, selectExperimentUserKnowledge, selectIsExperimentSaving} from '../../reducers';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {Observable, Subscription} from 'rxjs';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../../../../features/experiments/shared/experiments.const';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {ActivateEdit, CancelExperimentEdit, DeactivateEdit, ExperimentDataUpdated, SaveExperiment, SetExperimentErrors, SetExperimentFormErrors, UpdateSectionKnowledge} from '../../actions/common-experiments-info.actions';
import * as commonInfoActions from '../../actions/common-experiments-info.actions';
import {ExperimentModelsFormViewComponent} from '../../dumb/experiment-models-form-view/experiment-models-form-view.component';
import {getModelDesign} from '../../../tasks/tasks.utils';


@Component({
  selector: 'sm-experiment-info-input-model',
  templateUrl: './experiment-info-input-model.component.html',
  styleUrls: ['./experiment-info-input-model.component.scss']
})
export class ExperimentInfoInputModelComponent implements OnInit, OnDestroy {
  private selectedExperimentSubscription: Subscription;
  private formDataSubscription: Subscription;
  public modelInfo$: Observable<IExperimentModelInfo>;
  public selectedExperiment$: Observable<ISelectedExperiment>;
  public editable$: Observable<boolean>;
  public errors$: Observable<IExperimentInfoState['errors']>;
  public userKnowledge$: Observable<Map<experimentSectionsEnum, boolean>>;
  public modelLabels$: Observable<Model['labels']>;
  public saving$: Observable<boolean>;
  public selectedExperiment: ISelectedExperiment;
  public formData: IExperimentModelInfo;
  public modelProjectId: string;
  public inputDesign: any;

  @ViewChild('experimentModelForm') experimentModelForm: ExperimentModelsFormViewComponent;

  constructor(private store: Store<IExperimentInfoState>) {
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.errors$ = this.store.select(selectExperimentInfoErrors);
    this.userKnowledge$ = this.store.select(selectExperimentUserKnowledge);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
  }

  ngOnInit() {
    this.formDataSubscription = this.modelInfo$.subscribe(formData => {
      this.formData = formData;
      const design = getModelDesign(formData?.input?.design);
      this.inputDesign = (design.value === undefined || design.key === undefined && Object.keys(design.value).length === 0)? null : design.value;
      this.modelProjectId = this.formData?.input?.project?.id ? this.formData.input.project.id : '*';
    });
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.store.dispatch(new SetExperimentFormErrors(null));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription.unsubscribe();
    this.formDataSubscription.unsubscribe();
  }

  onFormValuesChanged(event: { field: string; value: any }) {
    this.store.dispatch(new ExperimentDataUpdated({id: this.selectedExperiment.id, changes: {[event.field]: event.value}}));
  }

  onFormErrorsChanged(event: { field: string; errors: any }) {
    this.store.dispatch(new SetExperimentErrors({[event.field]: event.errors}));
  }

  onModelSelected(model: Model) {
    this.store.dispatch(commonInfoActions.saveExperimentSection({execution: {model: model.id}}));
  }

  updateSectionKnowledge(section: experimentSectionsEnum) {
    this.store.dispatch(new UpdateSectionKnowledge(section));
  }

  cancelModelChange() {
    this.store.dispatch(new DeactivateEdit());
    this.store.dispatch(new CancelExperimentEdit());
  }

  activateEditChanged() {
    this.store.dispatch(new ActivateEdit('model'));
    !this.formData?.input?.id && this.experimentModelForm.chooseModel();
  }
}
