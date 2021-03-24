import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentModelInfoData} from '../../reducers';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {Observable, Subscription} from 'rxjs';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../../../../features/experiments/shared/experiments.const';
import {getModelDesign} from '../../../tasks/tasks.utils';

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
  private formDataSubscription: Subscription;
  public formData: IExperimentModelInfo;
  public outputDesign: any;
  public modelProjectId: string;

  constructor(private store: Store<IExperimentInfoState>) {
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
  }

  ngOnInit() {
    this.formDataSubscription = this.modelInfo$.subscribe(formData => {
      this.formData = formData;
      const design = getModelDesign(formData?.output?.design);
      this.outputDesign = (design.value === undefined || design.key === undefined && Object.keys(design.value).length === 0)? null : design.value;
      this.modelProjectId = this.formData?.input?.project?.id ? this.formData.input.project.id : '*';
    });
  }

  ngOnDestroy(): void {
    this.formDataSubscription.unsubscribe();
  }

}
