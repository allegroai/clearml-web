import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentHyperParamsSelectedSectionFromRoute, selectExperimentHyperParamsSelectedSectionParams, selectIsExperimentSaving, selectIsSelectedExperimentInDev} from '../../reducers';
import {ICommonExperimentInfoState} from '../../reducers/common-experiment-info.reducer';
import {IExperimentInfo, ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {selectBackdropActive} from '../../../core/reducers/view-reducer';
import {Observable, Subscription} from 'rxjs';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {selectRouterConfig} from '../../../core/reducers/router-reducer';
import {ActivateEdit, CancelExperimentEdit, DeactivateEdit, deleteHyperParamsSection, saveHyperParamsSection, SetExperimentFormErrors, updateExperimentAtPath} from '../../actions/common-experiments-info.actions';
import {ParamsItem} from '../../../../business-logic/model/tasks/paramsItem';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {Router} from '@angular/router';
import {ExperimentExecutionParametersComponent} from '../../dumb/experiment-execution-parameters/experiment-execution-parameters.component';
import {isReadOnly} from '../../../shared/utils/shared-utils';

@Component({
  selector   : 'sm-experiment-info-hyper-parameters-form-container',
  templateUrl: './experiment-info-hyper-parameters-form-container.component.html',
  styleUrls  : ['./experiment-info-hyper-parameters-form-container.component.scss']
})
export class ExperimentInfoHyperParametersFormContainerComponent implements OnInit, OnDestroy {
  HELP_TEXTS = HELP_TEXTS;
  sectionReplaceMap = {
    _legacy: 'General',
    properties: 'User Properties',
    design: 'General'
  };
  @ViewChild('parameterSection', {static: false}) parameterSection;
  @ViewChild('executionParamsForm', {static: false}) executionParamsForm: ExperimentExecutionParametersComponent;
  public selectedSectionHyperParams$: Observable<ParamsItem[]>;
  public editable$: Observable<boolean>;
  public isInDev$: Observable<boolean>;
  public saving$: Observable<boolean>;
  public backdropActive$: Observable<boolean>;
  private selectedExperimentSubscription: Subscription;
  public routerConfig$: Observable<string[]>;
  public selectedSection$: Observable<string>;
  private selectedSectionSubscription: Subscription;
  public selectedSection: string;
  public isExample: boolean;
  public selectedExperiment$: Observable<IExperimentInfo>;
  public propSection: boolean;

  constructor(private store: Store<ICommonExperimentInfoState>, protected router: Router) {

    this.selectedSectionHyperParams$ = this.store.select(selectExperimentHyperParamsSelectedSectionParams);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.selectedSection$ = this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute);
    this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.routerConfig$ = this.store.select(selectRouterConfig);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);

    this.store.dispatch(new SetExperimentFormErrors(null));
    this.selectedSectionSubscription = this.selectedSection$.subscribe(section => {
      this.selectedSection = section;
      this.propSection = section === 'properties';
    });
  }

  ngOnInit() {
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.isExample = isReadOnly(selectedExperiment);
      });
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription?.unsubscribe();
    this.selectedSectionSubscription?.unsubscribe();
  }


  cancelHyperParametersChange() {
    this.store.dispatch(updateExperimentAtPath({path: ('hyperparams.' + this.selectedSection ), value: this.executionParamsForm.formData}));
    this.store.dispatch(new DeactivateEdit());
    this.store.dispatch(new CancelExperimentEdit());
  }

  activateEditChanged(sectionName: string) {
    this.store.dispatch(new ActivateEdit(sectionName));
  }

  onFormValuesChanged(event: { field: string; value: any }) {
    this.store.dispatch(updateExperimentAtPath({path: ('hyperparams.' + event.field), value: event.value}));
  }

  sectionSaved() {
    if (this.executionParamsForm.formData.length > 0) {
      this.store.dispatch(saveHyperParamsSection({hyperparams: this.executionParamsForm.formData}));
    } else {
      this.store.dispatch(deleteHyperParamsSection({section: this.selectedSection}));

    }
    this.store.dispatch(new DeactivateEdit());
  }
}
