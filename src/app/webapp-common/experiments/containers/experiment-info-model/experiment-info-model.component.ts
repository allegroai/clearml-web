import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentModelInfoData, selectExperimentUserKnowledge, selectIsExperimentSaving} from '../../reducers';
import {IExperimentModelInfo, IModelInfo, IModelInfoSource} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {combineLatest, Observable, Subject} from 'rxjs';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../../../../features/experiments/shared/experiments.const';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import * as commonInfoActions from '../../actions/common-experiments-info.actions';
import {ActivateEdit, CancelExperimentEdit, DeactivateEdit} from '../../actions/common-experiments-info.actions';
import {ExperimentModelsFormViewComponent} from '../../dumb/experiment-models-form-view/experiment-models-form-view.component';
import {getModelDesign} from '../../../tasks/tasks.utils';
import {distinctUntilKeyChanged, filter, map, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {addMessage} from '../../../core/actions/layout.actions';


@Component({
  selector: 'sm-experiment-info-model',
  templateUrl: './experiment-info-model.component.html',
  styleUrls: ['./experiment-info-model.component.scss']
})
export class ExperimentInfoModelComponent implements OnInit, OnDestroy {
  public modelInfo$: Observable<IExperimentModelInfo>;
  public editable$: Observable<boolean>;
  public userKnowledge$: Observable<Map<experimentSectionsEnum, boolean>>;
  public modelLabels$: Observable<Model['labels']>;
  public saving$: Observable<boolean>;
  public modelProjectId: string;
  public inputDesign: any;
  private modelId: string;
  private unsubscribe$: Subject<boolean> = new Subject();
  public model: IModelInfo | undefined;
  public source: IModelInfoSource;
  private models: IModelInfo[];
  private routerModelId$: Observable<string>;
  public selectedExperiment$: Observable<IExperimentInfo>;
  public outputMode: boolean;

  @ViewChild('experimentModelForm') experimentModelForm: ExperimentModelsFormViewComponent;

  constructor(private store: Store<IExperimentInfoState>, private router: Router, private route: ActivatedRoute) {
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.userKnowledge$ = this.store.select(selectExperimentUserKnowledge);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
    this.routerModelId$ = this.route.params.pipe(
      takeUntil(this.unsubscribe$),
      filter(params => params.modelId),
      distinctUntilKeyChanged('modelId'),
      map(params => params.modelId));
  }

  ngOnInit() {


    combineLatest([this.routerModelId$, this.modelInfo$]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(([modelId, formData]) => {
        this.modelId = modelId;
        this.outputMode = this.route.snapshot.data?.outputModel;
        this.models = this.outputMode ? formData?.output : formData?.input;
        this.model = this.models?.find(model => model.id === this.modelId);
        this.source = {
          experimentId: this.model?.task?.id,
          projectId: this.model?.task?.project?.id,
          experimentName: this.model?.task?.name
        };
        const design = getModelDesign(this.model?.design);
        this.inputDesign = (design.value === undefined || design.key === undefined && Object.keys(design.value).length === 0) ? null : design.value;
        this.modelProjectId = this.model?.project?.id ? this.model.project.id : '*';
      });

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
  }

  onModelSelected(selectedModel: Model) {
    const modelFoundIndex = this.models.findIndex(model => model.id === this.modelId);
    if (this.models.map(m => m.id).includes(selectedModel.id)) {
      this.store.dispatch(addMessage('warn', 'Selected model is already an input-model'))
    } else {
      let newModels: { model: string; name: string }[];
      if (modelFoundIndex >= 0) {
        newModels = this.models.map(model => model.id !== this.modelId ? {model: model.id, name: model.name} : {model: selectedModel.id, name: selectedModel.name})
          .filter(model => model.model);
      } else {
        newModels = [...this.models.map(model => ({model: model.id, name: model.name})), {model: selectedModel.id, name: selectedModel.name}];
      }
      this.store.dispatch(new commonInfoActions.SetExperimentInfoData({models: {input: newModels as any}}));
      this.store.dispatch(commonInfoActions.saveExperimentSection({models: {input: newModels as any}}));
      this.router.navigate(['..', selectedModel.id || ''], {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }
  }

  cancelModelChange() {
    this.store.dispatch(new DeactivateEdit());
    this.store.dispatch(new CancelExperimentEdit());
  }

  activateEditChanged() {
    this.store.dispatch(new ActivateEdit('model'));
    !this.model?.id && this.experimentModelForm.chooseModel();
  }
}
