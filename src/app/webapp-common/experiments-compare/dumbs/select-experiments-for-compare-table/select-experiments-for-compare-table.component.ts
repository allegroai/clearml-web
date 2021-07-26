import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {ExperimentTableColFieldsEnum, ITableExperiment} from '../../../../webapp-common/experiments/shared/common-experiment-model.model';
import {Task} from '../../../../business-logic/model/tasks/task';

export const EXPERIMENTS_TABLE_COL_FIELDS = {
  SELECTED: 'selected' as ExperimentTableColFieldsEnum,
  TYPE    : 'type' as ExperimentTableColFieldsEnum,
  ID      : 'id' as ExperimentTableColFieldsEnum,
  NAME    : 'name' as ExperimentTableColFieldsEnum,
  USER    : 'user.name' as ExperimentTableColFieldsEnum,
  TAGS    : 'tags' as ExperimentTableColFieldsEnum,
  STATUS  : 'status' as ExperimentTableColFieldsEnum,
  PROJECT : 'project.name' as ExperimentTableColFieldsEnum,
};

export const INITIAL_EXPERIMENT_TABLE_COLS = [
  {
    id              : EXPERIMENTS_TABLE_COL_FIELDS.SELECTED,
    sortable        : false,
    filterable      : false,
    header          : '',
    hidden          : false,
    static          : true,
    headerStyleClass: 'selected-col-header',
    style           : {width: '20px'},
    disableDrag     : true,
    disablePointerEvents: true
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.TYPE,
    sortable   : false,
    filterable : false,
    static     : true,
    header     : 'TYPE',
    style      : {width: '40px'},
    disableDrag: true,
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.ID,
    sortable   : false,
    filterable : false,
    header     : 'ID',
    hidden     : true,
    static     : true,
    style      : {width: '150px'},
    disableDrag: true,
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.NAME,
    sortable   : false,
    static     : true,
    header     : 'NAME',
    style      : {width: '170px'},
    disableDrag: true,
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.USER,
    sortable   : false,
    static     : true,
    header     : 'USER',
    style      : {width: '115px'},
    disableDrag: true,
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.TAGS,
    sortable   : false,
    static     : true,
    header     : 'TAGS',
    style      : {width: '110px'},
    disableDrag: true,
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.STATUS,
    filterable : false,
    static     : true,
    header     : 'STATUS',
    style      : {width: '80px'},
    disableDrag: true,
  },
  {
    id         : EXPERIMENTS_TABLE_COL_FIELDS.PROJECT,
    filterable : false,
    static     : true,
    header     : 'PROJECT',
    style      : {width: '80px'},
    disableDrag: true,
  }
];

export enum ExperimentTagsEnum {
  Development = 'development',
  Archived = 'archived',
  Example = 'example'
}

export interface AddExperimentEvent {
  experiment: ITableExperiment;
  addOrRemoved: boolean;
}

@Component({
  selector       : 'sm-select-experiments-for-compare-table',
  templateUrl    : './select-experiments-for-compare-table.component.html',
  styleUrls      : ['./select-experiments-for-compare-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectExperimentsForCompareTableComponent implements OnInit {


  readonly EXPERIMENTS_TABLE_COL_FIELDS = EXPERIMENTS_TABLE_COL_FIELDS;
  readonly INITIAL_EXPERIMENT_TABLE_COLS = INITIAL_EXPERIMENT_TABLE_COLS;

  public cols: Array<ISmCol>;
  public statusFiltersValue: any;
  public typeFiltersValue: any;
  public menuPosition: { x: number; y: number };
  public menuData;
  public menuOpen: boolean = false;
  @Input() searchTerm;
  @Input() tableCols;
  @Input() experiments: Task[] = [];
  @Input() selectedExperiments: Array<any> = [];
  @Output() experimentsSelectionChanged = new EventEmitter<AddExperimentEvent>();


  constructor() {
  }

  ngOnInit(): void {

  }

  isThisRowSelected(experiment) {
    return this.selectedExperiments && (this.selectedExperiments.some((selectedExperimentId) => experiment && selectedExperimentId === experiment.id));
  }

  rowSelectedChanged(checked, experiment) {
    this.experimentsSelectionChanged.emit({experiment: experiment, addOrRemoved: checked.value});
  }
}
