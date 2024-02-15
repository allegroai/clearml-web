import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {Project} from '~/business-logic/model/projects/project';
import {trackByValue} from '@common/shared/utils/forms-track-by';
import {MatOptionSelectionChange} from '@angular/material/core';
import {rootProjectsPageSize} from '@common/constants';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';
import { PipelinesParameter } from '~/business-logic/model/pipelines/pipelinesParameter';
import { cloneDeep } from 'lodash-es';
import { PipelineParametersComponent } from '@common/pipelines/pipeline-parameters/pipeline-parameters.component';


@Component({
  selector: 'sm-create-new-pipeline-form',
  templateUrl: './create-new-pipeline-form.component.html',
  styleUrls: ['./create-new-pipeline-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNewPipelineFormComponent implements OnChanges, OnDestroy {
  public filteredProjects$: Observable<{ label: string; value: string }[]>;
  private _projects: Project[];
  public projectsOptions: { label: string; value: string }[];
  public trackByValue = trackByValue;
  public panelHeight: number;
  private subs = new Subscription();
  private rootFiltered: boolean;
  public readonly projectsRoot = {label: 'Projects root', value: null};
  @ViewChild('projectInput') projectInput: NgModel;

  public pipelinesNames: Array<string>;
  public projectsNames: Array<string>;
  public pipeline: { name: string; description: string; project: { label: string; value: string }, parameters: Array<PipelinesParameter>, tags: Array<string> } = {
    name: null,
    description: '',
    project: null,
    parameters: [{
      name: "Paramter1",
      value: ""
    }, {
      name: "Parameter2",
      value: ""
    }],
    tags: [],
  };
  filterText: string = '';
  isAutoCompleteOpen: boolean;

  // for parameters
  @ViewChild('pipelineParamsForm', {static: false}) pipelineParamsForm: PipelineParametersComponent;
  public searchedText: string;
  public searchResultsCount: number;
  public scrollIndexCounter: number;
  public size$: Observable<number>;

  @Input() readOnlyProjectsNames: string[];
  @Input() defaultProjectId: string;
  public loading: boolean;
  public noMoreOptions: boolean;
  private previousLength: number | undefined;

  @Input() set projects(projects: Project[]) {
  
    this.loading = false;
    this.noMoreOptions = projects?.length === this.previousLength || projects?.length < rootProjectsPageSize;
    this.previousLength = projects?.length;
    this._projects = projects;
    this.projectsOptions = [
      ...((this.rootFiltered || projects === null) ? [] : [this.projectsRoot]),
      ...(projects ? projects.map(project => ({label: project.name, value: project.id})) : [])
    ];
    this.projectsNames = this.projectsOptions.map(project => project.label);
  }

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

  get projects() {
    return this._projects;
  }

  @Output() pipelineCreated = new EventEmitter();
  @Output() filterSearchChanged = new EventEmitter<{value: string; loadMore?: boolean}>();

  ngOnInit(): void {
    this.searchChanged(['*', null].includes(this.defaultProjectId) ? '' : this.defaultProjectId);
    setTimeout(() => {
      this.subs.add(this.projectInput.valueChanges.subscribe(searchString => {
          if (searchString !== this.pipeline.project) {
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
    if (this.projects?.length > 0 && this.pipeline.project === null) {
      this.pipeline.project = this.projectsOptions.find(p => p.value === this.defaultProjectId) || {label: this.projectsRoot.label, value: null};
      this.projectInput.control.updateValueAndValidity();
    }
  }

  createNewSelected($event: MatOptionSelectionChange) {
    this.pipeline.project = {label: $event.source.value, value: null};
  }

  projectSelected($event: MatOptionSelectionChange) {
    this.pipeline.project = {label: $event.source.value.label, value: $event.source.value.value};
  }
  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  displayFn(project: IOption | string) {
    return typeof project === 'string' ? project : project?.label;
  }

  clear() {
    this.projectInput.control.setValue('');
  }

  send() {
    if (this.pipelineParamsForm.formData.length > 0) {
     this.pipeline.parameters = cloneDeep(this.pipelineParamsForm.formData);
    }
    this.pipelineCreated.emit(this.pipeline);
  }

  searchChanged(searchString: string) {
    this.projectsOptions = null;
    this.projectsNames = null;
    this.rootFiltered = searchString && !this.projectsRoot.label.toLowerCase().includes(searchString.toLowerCase());
    searchString !== null && this.filterSearchChanged.emit({value: searchString, loadMore: false});
  }

  loadMore(searchString) {
    this.loading = true;
    this.filterSearchChanged.emit({value: searchString || '', loadMore: true});
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }


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

