import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {trackByValue} from '@common/shared/utils/forms-track-by';
import {MatOptionSelectionChange} from '@angular/material/core';
import {rootProjectsPageSize} from '@common/constants';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';
import { Task } from '~/business-logic/model/tasks/task';
import { PipelineParametersComponent } from '@common/pipelines/pipeline-parameters/pipeline-parameters.component';

import { cloneDeep, upperCase } from 'lodash-es';
import { ParamsItem } from '~/business-logic/model/tasks/paramsItem';


@Component({
  selector: 'sm-pipeline-add-step-form',
  templateUrl: './pipeline-add-step-form.component.html',
  styleUrls: ['./pipeline-add-step-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipelineAddStepFormComponent implements OnChanges, OnDestroy {
  public filteredExperiments$: Observable<{ label: string; value: string }[]>;
  private _experiments: Task[];
  public experimentsOptions: { label: string; value: string }[];
  public trackByValue = trackByValue;
  public panelHeight: number;
  private subs = new Subscription();
  private rootFiltered: boolean;
  public readonly experimentsRoot = {label: 'My experiment', value: null, parameters: []};
  @ViewChild('experimentInput') experimentInput: NgModel;

  public pipelinesNames: Array<string>;
  public experimentsNames: Array<string>;
  public step: { name: string; description: string; experiment: { label: string; value: string }, experimentDetails: Task , parameters: Array<ParamsItem> } = {
    name: null,
    description: '',
    experiment: null,
    parameters: [],
    experimentDetails: {}
  };
  filterText: string = '';
  isAutoCompleteOpen: boolean;

    // for parameters
    @ViewChild('stepParamsForm', {static: false}) stepParamsForm: PipelineParametersComponent;
    public searchedText: string;
    public searchResultsCount: number;
    public scrollIndexCounter: number;
    public size$: Observable<number>;
    constructor(/* private store: Store, protected router: Router, */ private cdr: ChangeDetectorRef) {
      // this.selectedSectionHyperParams$ = this.store.select(selectExperimentHyperParamsSelectedSectionParams);
      // this.editable$ = this.store.select(selectIsExperimentEditable);
      // this.selectedSection$ = this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute);
      // this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
      // this.saving$ = this.store.select(selectIsExperimentSaving);
      // this.backdropActive$ = this.store.select(selectBackdropActive);
      // this.routerConfig$ = this.store.select(selectRouterConfig);
      // this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
      // this.size$ = this.store.select(selectSplitSize);
  
      // this.store.dispatch(setExperimentFormErrors({errors: null}));
      // this.selectedSectionSubscription = this.selectedSection$.subscribe(section => {
      //   this.selectedSection = section;
      //   this.propSection = section === 'properties';
      // });
    }


  @Input() readOnlyExperimentsNames: string[];
  @Input() defaultExperimentId: string;
  public loading: boolean;
  public noMoreOptions: boolean;
  private previousLength: number | undefined;

  @Input() set experiments(experiments: Task[]) {
  
    this.loading = false;
    this.noMoreOptions = experiments?.length === this.previousLength || experiments?.length < rootProjectsPageSize;
    this.previousLength = experiments?.length;
    this._experiments = experiments;
    this.experimentsOptions = [
      ...((this.rootFiltered || experiments === null) ? [] : [this.experimentsRoot]),
      ...(experiments ? experiments.map(experiment => ({label: experiment.name +  " ("+ upperCase(experiment?.status) + ")", value: experiment.id, parameters: experiment.hyperparams, otherDetails: {...experiment}})) : [])
    ];
    this.experimentsNames = this.experimentsOptions.map(experiment => experiment.label);
  }

  get experiments() {
    return this._experiments;
  }

  @Output() stepCreated = new EventEmitter();
  @Output() filterSearchChanged = new EventEmitter<{value: string; loadMore?: boolean}>();

  ngOnInit(): void {
    this.searchChanged(['*', null].includes(this.defaultExperimentId) ? '' : this.defaultExperimentId);
    setTimeout(() => {
      this.subs.add(this.experimentInput.valueChanges.subscribe(searchString => {
          if (searchString !== this.step.experiment) {
            this.searchChanged(searchString?.label || searchString || '');
          }
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(): void {
    if (this.experiments?.length > 0 && this.step.experiment === null) {
      this.step.experiment = this.experimentsOptions.find(p => p.value === this.defaultExperimentId) || {label: this.experimentsRoot.label, value: null};
      this.experimentInput.control.updateValueAndValidity();
    }
  }

  createNewSelected($event: MatOptionSelectionChange) {
    this.step.experiment = {label: $event.source.value, value: null};
  }

  experimentSelected($event: MatOptionSelectionChange) {
    this.step.experiment = {label: $event.source.value.label, value: $event.source.value.value};
    this.step.parameters = [];
    this.step.experimentDetails = {
      ...cloneDeep($event.source?.value?.otherDetails)
    };
    for (const section in  $event.source?.value?.parameters) { 
      for (const param in  $event.source?.value?.parameters[section]) { 
        // eslint-disable-next-line no-console
        // console.log($event.source?.value?.parameters[section][param]);
        this.step.parameters.push({
        name: $event.source?.value?.parameters[section][param].name,
        value: $event.source?.value?.parameters[section][param].value,
        section: $event.source?.value?.parameters[section][param].section
      })
      }
    }
   //.map((paramSectionKey, paramSectionValue) => {
      // eslint-disable-next-line no-console
      
    //  paramSec.forEach((paraKey, paramVal) => {
    //   
    //  })
    //});
  }
  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  displayFn(experiment: IOption | string) {
    return typeof experiment === 'string' ? experiment : experiment?.label;
  }

  clear() {
    this.experimentInput.control.setValue('');
  }

  send() {
    if (this.stepParamsForm?.formData?.length > 0) {
      this.step.parameters = cloneDeep(this.stepParamsForm.formData);
     }
    this.stepCreated.emit(this.step);
  }

  searchChanged(searchString: string) {
    this.experimentsOptions = null;
    this.experimentsNames = null;
    this.rootFiltered = searchString && !this.experimentsRoot.label.toLowerCase().includes(searchString.toLowerCase());
    searchString !== null && this.filterSearchChanged.emit({value: searchString, loadMore: false});
  }

  loadMore(searchString) {
    this.loading = true;
    this.filterSearchChanged.emit({value: searchString || '', loadMore: true});
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }

  // for parameters
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   searchTable(value: string) {
    // const searchBackward = value === null;
    // if (this.searchedText !== value && !searchBackward) {
    //   this.searchedText = value;
    //   this.scrollIndexCounter = -1;
    //   this.searchResultsCount = 0;
    //   // this.executionParamsForm.resetIndex();
    //   this.cdr.detectChanges();
    // }
    // // this.executionParamsForm.jumpToNextResult(!searchBackward);
  }
  searchCounterChanged(count: number) {
    this.searchResultsCount = count;
    this.cdr.detectChanges();
  }
  scrollIndexCounterReset() {
    this.scrollIndexCounter = -1;
    this.cdr.detectChanges();
  }
  onFormValuesChanged(event: { field: string; value: any }) {
    // eslint-disable-next-line no-console
    console.log(event);
    // this.store.dispatch(updateExperimentAtPath({path: ('hyperparams.' + event.field), value: event.value}));
  }
}

