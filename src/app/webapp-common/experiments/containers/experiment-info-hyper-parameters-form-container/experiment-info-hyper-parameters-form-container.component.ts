import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {
  selectExperimentHyperParamsSelectedSectionFromRoute,
  selectExperimentHyperParamsSelectedSectionParams,
  selectIsExperimentSaving,
  selectIsSelectedExperimentInDev,
  selectSplitSize,
} from '../../reducers';
import {CommonExperimentInfoState} from '../../reducers/common-experiment-info.reducer';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {selectBackdropActive} from '@common/core/reducers/view.reducer';
import {Observable, Subscription} from 'rxjs';
import {selectIsExperimentEditable, selectSelectedExperiment} from '~/features/experiments/reducers';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {
  activateEdit,
  cancelExperimentEdit,
  deactivateEdit,
  deleteHyperParamsSection,
  saveHyperParamsSection,
  setExperimentFormErrors,
  updateExperimentAtPath
} from '../../actions/common-experiments-info.actions';
import {ParamsItem} from '~/business-logic/model/tasks/paramsItem';
import {Router} from '@angular/router';
import {ExperimentExecutionParametersComponent} from '../../dumb/experiment-execution-parameters/experiment-execution-parameters.component';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector   : 'sm-experiment-info-hyper-parameters-form-container',
  templateUrl: './experiment-info-hyper-parameters-form-container.component.html',
  styleUrls  : ['./experiment-info-hyper-parameters-form-container.component.scss']
})
export class ExperimentInfoHyperParametersFormContainerComponent implements OnInit, OnDestroy {
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
  public searchedText: string;
  public searchResultsCount: number;
  public scrollIndexCounter: number;
  public size$: Observable<number>;

  constructor(private store: Store<CommonExperimentInfoState>, protected router: Router, private cdr: ChangeDetectorRef) {

    this.selectedSectionHyperParams$ = this.store.select(selectExperimentHyperParamsSelectedSectionParams);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.selectedSection$ = this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute);
    this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.routerConfig$ = this.store.select(selectRouterConfig);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
    this.size$ = this.store.select(selectSplitSize);

    this.store.dispatch(setExperimentFormErrors({errors: null}));
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
    // this.store.dispatch(updateExperimentAtPath({path: ('hyperparams.' + this.selectedSection ), value: this.executionParamsForm.formData}));
    this.store.dispatch(deactivateEdit());
    this.store.dispatch(cancelExperimentEdit());
  }

  activateEditChanged(sectionName: string) {
    this.store.dispatch(activateEdit(sectionName));
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
    this.store.dispatch(deactivateEdit());
  }

  searchTable(value: string) {
    const searchBackward = value === null;
    if (this.searchedText !== value && !searchBackward) {
      this.searchedText = value;
      this.scrollIndexCounter = -1;
      this.searchResultsCount = 0;
      this.executionParamsForm.resetIndex();
      this.cdr.detectChanges();
    }
    this.executionParamsForm.jumpToNextResult(!searchBackward);
  }

  searchCounterChanged(count: number) {
    this.searchResultsCount = count;
    this.cdr.detectChanges();
  }

  scrollIndexCounterReset() {
    this.scrollIndexCounter = -1;
    this.cdr.detectChanges();
  }
}
