import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {cloneDeep} from 'lodash/fp';
import {v4 as uuidV4} from 'uuid';
import {NgForm} from '@angular/forms';
import {ParamsItem} from '../../../../business-logic/model/tasks/paramsItem';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Subscription} from 'rxjs';


@Component({
  selector   : 'sm-experiment-execution-parameters',
  templateUrl: './experiment-execution-parameters.component.html',
  styleUrls  : ['./experiment-execution-parameters.component.scss']
})
export class ExperimentExecutionParametersComponent implements IExperimentInfoFormComponent, OnDestroy, AfterViewInit {
  private _formData: { name?: string; description?: string; section?: string; id: string; type?: string; value?: string }[]=[];
  private formContainersSub: Subscription;

  formNames(id) {
    return this.formData.filter(parameter=> parameter.id!== id).map(parameter => parameter.name);
  }

  @ViewChild('hyperParameters') hyperParameters: NgForm;
  private formContainer: CdkVirtualScrollViewport;
  @ViewChildren('formContainer') formContainers: QueryList<CdkVirtualScrollViewport>;
  @Output() formDataChanged = new EventEmitter<{ field: string; value: ParamsItem[] }>();
  @Input() section;

  @Input() set formData(formData: { name?: string; description?: string; section?: string; id?: string; type?: string; value?: string }[]) {
      this._formData = cloneDeep(formData).map((row: ParamsItem) => ({...row, id: uuidV4()}));
  }

  get formData(): { name?: string; description?: string; section?: string; id?: string; type?: string; value?: string }[] {
    return this._formData;
  }


  @Input() editable: boolean;

  HELP_TEXTS = HELP_TEXTS;
  public cols = [
    { id: 'name', style: {width: '48%'}},
    { id: 'value', style: {width: 'auto'}},
    { id: 'description', style: {width: '48px'}}
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
      id         : uuidV4(),
      section    : this.section,
      name       : '',
      value      : '',
      description: '',
      type       : ''
    });
    window.setTimeout(() => {
      const height = this.formContainer.elementRef.nativeElement.scrollHeight;
      this.formContainer.scrollToIndex(height, 'smooth');
    }, 50);
  }

  removeRow(index) {
    this.formData.splice(index, 1);
  }

  rowActivated({data, e}: {data: any; e: MouseEvent}) {
    this.clickedRow = this.formData.findIndex(row => row.name === data.name);
  }

  ngOnDestroy(): void {
    this.formContainersSub?.unsubscribe();
  }
}
