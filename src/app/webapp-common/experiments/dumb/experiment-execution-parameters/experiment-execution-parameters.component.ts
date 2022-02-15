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
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {cloneDeep} from 'lodash/fp';
import {v4 as uuidV4} from 'uuid';
import {NgForm} from '@angular/forms';
import {ParamsItem} from '../../../../business-logic/model/tasks/paramsItem';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Subscription} from 'rxjs';
import {TableComponent} from '../../../shared/ui-components/data/table/table.component';
import {isEqual} from 'lodash/fp';


@Component({
  selector: 'sm-experiment-execution-parameters',
  templateUrl: './experiment-execution-parameters.component.html',
  styleUrls: ['./experiment-execution-parameters.component.scss']
})
export class ExperimentExecutionParametersComponent implements IExperimentInfoFormComponent, OnDestroy, AfterViewInit, OnChanges {
  private _formData: { name?: string; description?: string; section?: string; id: string; type?: string; value?: string }[] = [];
  private formContainersSub: Subscription;

  search: string = '';
  lastSearchIndex = -1;
  public searchIndexList: {index:number, col: string}[];
  public matchIndex: number;

  formNames(id) {
    return this.formData.filter(parameter => parameter.id !== id).map(parameter => parameter.name);
  }

  @ViewChild('hyperParameters') hyperParameters: NgForm;
  @ViewChild('parametersTable') executionParametersTable: TableComponent;

  private formContainer: CdkVirtualScrollViewport;
  @ViewChildren('formContainer') formContainers: QueryList<CdkVirtualScrollViewport>;
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @Output() formDataChanged = new EventEmitter<{ field: string; value: ParamsItem[] }>();
  @Output() searchCounterChanged = new EventEmitter<number>();
  @Output() resetSearch = new EventEmitter();
  @Output() scrollToResultCounterChanged = new EventEmitter<number>();
  @Input() section;

  @Input() set formData(formData: { name?: string; description?: string; section?: string; id?: string; type?: string; value?: string }[]) {
    this._formData = cloneDeep(formData).map((row: ParamsItem) => ({...row, id: uuidV4()}));
  }

  get formData(): { name?: string; description?: string; section?: string; id?: string; type?: string; value?: string }[] {
    return this._formData;
  }


  @Input() editable: boolean;
  @Input() searchedText: string;

  HELP_TEXTS = HELP_TEXTS;
  public cols = [
    {id: 'name', style: {width: '40%'}},
    {id: 'value', style: {width: '40%'}},
    {id: 'description', style: {width: '48px'}}
  ] as ISmCol[];
  private clickedRow: number;

  ngAfterViewInit() {
    this.formContainersSub = this.formContainers.changes
      .subscribe((list: QueryList<CdkVirtualScrollViewport>) => {
        this.formContainer = list.first;
        if (this.formContainer && this.clickedRow !== null) {
          this.formContainer.scrollToIndex(this.clickedRow, 'smooth');
          this.clickedRow = null;
        }
      });
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

  jumpToResult(counterIndex: number) {
    this.matchIndex = counterIndex;
    if(this.editable){
      this.viewPort.scrollToIndex(this.searchIndexList[counterIndex]?.index, 'smooth');
    } else {
      this.executionParametersTable.scrollToIndex(this.searchIndexList[counterIndex]?.index);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.formData && (!changes.formData?.firstChange) && !isEqual(changes.formData.currentValue, changes.formData.previousValue)){
      this.matchIndex = undefined;
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
            searchedIndexList.push({index, col:'name'});
          }
          if (parameter?.value.includes(changes.searchedText.currentValue)){
            searchResultsCounter++;
            searchedIndexList.push({index, col:'value'});
          }
        });
      }
      this.searchCounterChanged.emit(searchResultsCounter);
      this.scrollToResultCounterChanged.emit(-1);
      this.searchIndexList = searchedIndexList;
    }
  }

}
