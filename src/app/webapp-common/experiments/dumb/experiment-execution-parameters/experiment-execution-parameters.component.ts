import {
  Component,
  OnChanges,
  SimpleChanges, inject, viewChild, viewChildren, output, effect, input } from '@angular/core';
import {cloneDeep} from 'lodash-es';
import {v4 as uuidV4} from 'uuid';
import {NgForm} from '@angular/forms';
import {ParamsItem} from '~/business-logic/model/tasks/paramsItem';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {isEqual} from 'lodash-es';
import {MatInput} from '@angular/material/input';
import {Store} from '@ngrx/store';
import { navigateToDataset } from '@common/experiments/actions/common-experiments-info.actions';
import {trackByIndex} from '@common/shared/utils/forms-track-by';

export interface ExecutionParameter {
  name?: string;
  description?: string;
  section?: string;
  id: string;
  type?: string;
  value?: string;
}

@Component({
  selector: 'sm-experiment-execution-parameters',
  templateUrl: './experiment-execution-parameters.component.html',
  styleUrls: ['./experiment-execution-parameters.component.scss']
})
export class ExperimentExecutionParametersComponent implements OnChanges {
  private store = inject(Store);

  form = [] as ExecutionParameter[];
  private clickedRow: number;

  public search = '';
  public searchIndexList: {index: number; col: string}[] = [];
  public matchIndex = -1;
  public cols = [
    {id: 'name', style: {width: '300px'}},
    {id: 'value', style: {width: '60%'}},
    {id: 'description', style: {width: '48px'}}
  ] as ISmCol[];


  hyperParameters = viewChild<NgForm>('hyperParameters');
  executionParametersTable = viewChild<TableComponent<ExecutionParameter>>(TableComponent);

  formContainer = viewChild(CdkVirtualScrollViewport);
  rows = viewChildren<MatInput>('row');
  viewPort = viewChild(CdkVirtualScrollViewport);
  formDataChanged = output<{
        field: string;
        value: ParamsItem[];
    }>();
  searchCounterChanged = output<number>();
  resetSearch = output();
  scrollToResultCounterReset = output();
  section = input<string>();

  size = input<number>();
  formData = input<ExecutionParameter[]>();


  editable = input<boolean>();

  searchedText = input<string>();

  constructor() {
    effect(() => {
      if (this.formContainer() && this.clickedRow !== null) {
        this.formContainer().scrollToIndex(this.clickedRow, 'smooth');
        this.clickedRow = null;
      }
    });

    effect(() => {
      this.size();
      this.executionParametersTable()?.resize();
    });

    effect(() => {
      this.form = cloneDeep(this.formData()).map((row: ParamsItem) => ({...row, id: uuidV4()}));
    });

    effect(() => {
      if (this.editable()) {
        window.setTimeout(() => this.rows()?.[0]?.focus());
      }
      this.executionParametersTable()?.resize();
    });
  }

  formNames(id) {
    return this.form.filter(parameter => parameter.id !== id).map(parameter => parameter.name);
  }

  addRow() {
    this.form.push({
      id: uuidV4(),
      section: this.section(),
      name: '',
      value: '',
      description: '',
      type: ''
    });
    window.setTimeout(() => {
      const height = this.viewPort().elementRef.nativeElement.scrollHeight;
      this.viewPort().scrollToIndex(height, 'smooth');
    }, 50);
  }

  removeRow(index) {
    this.form.splice(index, 1);
  }

  rowActivated({data}: { data: ExecutionParameter; e: MouseEvent }) {
    this.clickedRow = this.form.findIndex(row => row.name === data.name);
  }

  resetIndex() {
    this.matchIndex = -1;
  }

  jumpToNextResult(forward: boolean) {
    this.matchIndex = forward ? this.matchIndex + 1 : this.matchIndex - 1;
    if (this.editable()) {
      this.viewPort().scrollToIndex(this.searchIndexList[this.matchIndex]?.index, 'smooth');
    } else {
      this.executionParametersTable().scrollToIndex(this.searchIndexList[this.matchIndex]?.index);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.formData && (!changes.formData?.firstChange) && !isEqual(changes.formData.currentValue, changes.formData.previousValue)) {
      this.matchIndex = -1;
      this.searchIndexList = [];
      this.resetSearch.emit();
    }
    if (changes?.searchedText) {
      let searchResultsCounter = 0;
      const searchedIndexList = [];
      if (changes?.searchedText?.currentValue) {
        this.formData().forEach((parameter, index) => {
          if (parameter?.name.includes(changes.searchedText.currentValue)) {
            searchResultsCounter++;
            searchedIndexList.push({index, col: 'name'});
          }
          if (parameter?.value.includes(changes.searchedText.currentValue)) {
            searchResultsCounter++;
            searchedIndexList.push({index, col: 'value'});
          }
        });
      }
      this.searchCounterChanged.emit(searchResultsCounter);
      this.scrollToResultCounterReset.emit();
      this.searchIndexList = searchedIndexList;
    }
  }

  cancel() {
    this.form = cloneDeep(this.formData()).map((row: ParamsItem) => ({...row, id: uuidV4()}));
  }

  nextRow(event: Event, index: number) {
    event.stopPropagation();
    event.preventDefault();
    if (this.formData().length === index + 1) {
      this.addRow();
    }
    window.setTimeout(()=> this.rows().at(index + 1)?.focus());
  }

  navigateToDataset(datasetId: string) {
    this.store.dispatch(navigateToDataset({datasetId}));
  }

  protected readonly trackByIndex = trackByIndex;
}
