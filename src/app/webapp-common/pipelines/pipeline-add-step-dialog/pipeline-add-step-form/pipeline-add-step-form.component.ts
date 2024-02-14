import {
  ChangeDetectionStrategy,
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
  public readonly experimentsRoot = {label: 'My experiment', value: null};
  @ViewChild('experimentInput') experimentInput: NgModel;

  public pipelinesNames: Array<string>;
  public experimentsNames: Array<string>;
  public step: { name: string; description: string; experiment: { label: string; value: string }, parameters: Array<object> } = {
    name: null,
    description: '',
    experiment: null,
    parameters: [],
  };
  filterText: string = '';
  isAutoCompleteOpen: boolean;

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
      ...(experiments ? experiments.map(experiment => ({label: experiment.name, value: experiment.id})) : [])
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
}

