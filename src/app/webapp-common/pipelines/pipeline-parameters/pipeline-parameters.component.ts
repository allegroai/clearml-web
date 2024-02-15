import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input, OnChanges,
  OnDestroy,
  Output,
  QueryList, SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {IExperimentInfoFormComponent} from '~/features/experiments/shared/experiment-info.model';
import {cloneDeep} from 'lodash-es';
import {v4 as uuidV4} from 'uuid';
import {NgForm} from '@angular/forms';
import {ParamsItem} from '~/business-logic/model/tasks/paramsItem';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Subscription} from 'rxjs';
// import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {isEqual} from 'lodash-es';
import {MatInput} from '@angular/material/input';
import {Store} from '@ngrx/store';
import { navigateToDataset } from '@common/experiments/actions/common-experiments-info.actions';
import {trackByIndex} from '@common/shared/utils/forms-track-by';
import { PipelinesParameter } from '~/business-logic/model/pipelines/pipelinesParameter';



@Component({
  selector: 'sm-pipeline-parameters',
  templateUrl: './pipeline-parameters.component.html',
  styleUrls: ['./pipeline-parameters.component.scss']
})
export class PipelineParametersComponent implements IExperimentInfoFormComponent, OnDestroy, AfterViewInit, OnChanges {
  private _formData = [] as PipelinesParameter[];
  private formContainersSub: Subscription;
  private _editable: boolean = true;
  private formContainer: CdkVirtualScrollViewport;
  private clickedRow: number;

  public search = '';
  public searchIndexList: {index: number; col: string}[] = [];
  public matchIndex = -1;
  public cols = [
    {id: 'name', style: {width: '300px'}},
    {id: 'value', style: {width: '300px'}},
    {id: 'description', style: {width: '48px'}}
  ] as ISmCol[];


  @ViewChild('hyperParameters') hyperParameters: NgForm;
  // @ViewChild(TableComponent) executionParametersTable: TableComponent<PipelinesParameter>;

  @ViewChildren('formContainer') formContainers: QueryList<CdkVirtualScrollViewport>;
  @ViewChildren('row') rows: QueryList<MatInput>;
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @Output() formDataChanged = new EventEmitter<{ field: string; value: ParamsItem[] }>();
  @Output() searchCounterChanged = new EventEmitter<number>();
  @Output() resetSearch = new EventEmitter();
  @Output() scrollToResultCounterReset = new EventEmitter();
  @Input() section;
  private _originalData: PipelineParametersComponent['formData'];

  // @Input() set size(size: number) {
  //   this.executionParametersTable?.resize();
  // }

  @Input() set formData(formData) {
    this._originalData = formData;
    this._formData = cloneDeep(formData).map((row: ParamsItem) => ({...row, id: uuidV4()}));
    // console.log(this._formData);
  }

  get formData() {
    return this._formData;
  }


  // @Input() set editable(editable: boolean) {
  //   this._editable = editable;
  //   this.executionParametersTable?.resize();
  //   editable && window.setTimeout(() => this.rows.first?.focus());
  // }
  get editable() {
    return this._editable;
  }

  @Input() searchedText: string;

  constructor(private store: Store) {}

  ngAfterViewInit() {
    this.formContainersSub = this.formContainers.changes
      .subscribe((list: QueryList<CdkVirtualScrollViewport>) => {
        this.formContainer = list.first;
        if (this.formContainer && this.clickedRow !== null) {
          this.formContainer.scrollToIndex(this.clickedRow, 'smooth');
          this.clickedRow = null;
        }
      });
    //this.executionParametersTable.resize();
  }

  formNames(name) {
    return this.formData.filter(parameter => parameter.name !== name).map(parameter => parameter.name);
  }

  addRow() {
    this.formData.push({
      id: uuidV4(),
      name: '',
      value: '',
      description: '',
      type: ''
    });
    window.setTimeout(() => {
      const height = this.viewPort.elementRef.nativeElement.scrollHeight;
      this.viewPort.scrollToIndex(height, 'smooth');
    }, 50);
  }

  removeRow(index) {
    this.formData.splice(index, 1);
  }

  rowActivated({data}: { data: PipelinesParameter; e: MouseEvent }) {
    this.clickedRow = this.formData.findIndex(row => row.name === data.name);
  }

  ngOnDestroy(): void {
    this.formContainersSub?.unsubscribe();
  }

  resetIndex() {
    this.matchIndex = -1;
  }

  jumpToNextResult(forward: boolean) {
    this.matchIndex = forward ? this.matchIndex + 1 : this.matchIndex - 1;
    if (this.editable) {
      this.viewPort.scrollToIndex(this.searchIndexList[this.matchIndex]?.index, 'smooth');
    } else {
      // this.executionParametersTable.scrollToIndex(this.searchIndexList[this.matchIndex]?.index);
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
        this.formData.forEach((parameter, index) => {
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
    this._formData = cloneDeep(this._originalData).map((row: ParamsItem) => ({...row, id: uuidV4()}));
  }

  nextRow(event: Event, index: number) {
    event.stopPropagation();
    event.preventDefault();
    if (this.formData.length === index + 1) {
      this.addRow();
    }
    window.setTimeout(()=> this.rows.get(index + 1)?.focus());
  }

  navigateToDataset(datasetId: string) {
    this.store.dispatch(navigateToDataset({datasetId}));
  }

  protected readonly trackByIndex = trackByIndex;
}
