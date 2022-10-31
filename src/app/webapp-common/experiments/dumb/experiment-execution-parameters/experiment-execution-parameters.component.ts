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
import {cloneDeep} from 'lodash/fp';
import {v4 as uuidV4} from 'uuid';
import {NgForm} from '@angular/forms';
import {ParamsItem} from '~/business-logic/model/tasks/paramsItem';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Subscription} from 'rxjs';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {isEqual} from 'lodash/fp';


@Component({
  selector: 'sm-experiment-execution-parameters',
  templateUrl: './experiment-execution-parameters.component.html',
  styleUrls: ['./experiment-execution-parameters.component.scss']
})
export class ExperimentExecutionParametersComponent implements IExperimentInfoFormComponent, OnDestroy, AfterViewInit, OnChanges {
  private _formData: { name?: string; description?: string; section?: string; id: string; type?: string; value?: string }[] = [];
  private formContainersSub: Subscription;
  private _editable: boolean;
  private formContainer: CdkVirtualScrollViewport;
  private clickedRow: number;

  search: string = '';
  public searchIndexList: {index: number; col: string}[];
  public matchIndex: number = -1;
  public cols = [
    {id: 'name', style: {width: '300px'}},
    {id: 'value', style: {width: '300px'}},
    {id: 'description', style: {width: '48px'}}
  ] as ISmCol[];


  @ViewChild('hyperParameters') hyperParameters: NgForm;
  @ViewChild(TableComponent) executionParametersTable: TableComponent;

  @ViewChildren('formContainer') formContainers: QueryList<CdkVirtualScrollViewport>;
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @Output() formDataChanged = new EventEmitter<{ field: string; value: ParamsItem[] }>();
  @Output() searchCounterChanged = new EventEmitter<number>();
  @Output() resetSearch = new EventEmitter();
  @Output() scrollToResultCounterReset = new EventEmitter();
  @Input() section;
  private _originalData: ExperimentExecutionParametersComponent['formData'];

  @Input() set size(size: number) {
    this.executionParametersTable?.resize();
  }

  @Input() set formData(formData: { name?: string; description?: string; section?: string; id?: string; type?: string; value?: string }[]) {
    this._originalData = formData;
    this._formData = cloneDeep(formData).map((row: ParamsItem) => ({...row, id: uuidV4()}));
  }

  get formData(): { name?: string; description?: string; section?: string; id?: string; type?: string; value?: string }[] {
    return this._formData;
  }


  @Input() set editable(editable: boolean) {
    this._editable = editable;
    this.executionParametersTable?.resize();
  }
  get editable() {
    return this._editable;
  }

  @Input() searchedText: string;

  ngAfterViewInit() {
    this.formContainersSub = this.formContainers.changes
      .subscribe((list: QueryList<CdkVirtualScrollViewport>) => {
        this.formContainer = list.first;
        if (this.formContainer && this.clickedRow !== null) {
          this.formContainer.scrollToIndex(this.clickedRow, 'smooth');
          this.clickedRow = null;
        }
      });
    this.executionParametersTable.resize();
  }

  formNames(id) {
    return this.formData.filter(parameter => parameter.id !== id).map(parameter => parameter.name);
  }

  addRow() {
    this.formData.push({
      id: uuidV4(),
      section: this.section,
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

  rowActivated({data}: { data: any; e: MouseEvent }) {
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
      this.executionParametersTable.scrollToIndex(this.searchIndexList[this.matchIndex]?.index);
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
}
