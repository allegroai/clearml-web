import {ColHeaderFilterTypeEnum, ColHeaderTypeEnum, ISmCol} from '../shared/ui-components/data/table/table.consts';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {rootProjectsPageSize} from '@common/constants';

export const INITIAL_CONTROLLER_TABLE_COLS: ISmCol[] = [
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.SELECTED,
    sortable: false,
    filterable: false,
    headerType: ColHeaderTypeEnum.checkBox,
    header: '',
    hidden: false,
    bodyStyleClass: 'selected-col-body type-col',
    headerStyleClass: 'selected-col-header',
    style: {width: '65px'},
    disableDrag: true,
    disablePointerEvents: true,
  },
  {
    id            : EXPERIMENTS_TABLE_COL_FIELDS.ID,
    headerType    : ColHeaderTypeEnum.title,
    header        : 'ID',
    style         : {width: '200px'}
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.NAME,
    headerType: ColHeaderTypeEnum.sortFilter,
    header: 'RUN',
    style: {width: '400px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.VERSION,
    getter: `${EXPERIMENTS_TABLE_COL_FIELDS.VERSION}.value`,
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    sortable: true,
    isParam: true,
    header: 'VERSION',
    style: {width: '200px'},
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.TAGS,
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    searchableFilter: true,
    sortable: false,
    header: 'TAGS',
    style: {width: '300px'},
    excludeFilter: true,
    andFilter: true,
    columnExplain: 'Click to include tag. Click again to exclude.',
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.STATUS,
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    header: 'STATUS',
    style: {width: '115px'},
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.PROJECT,
    headerType: ColHeaderTypeEnum.title,
    header: 'PROJECT',
    style: {width: '150px'},
    filterable  :  true,
    searchableFilter: true,
    asyncFilter: true,
    paginatedFilterPageSize: rootProjectsPageSize
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.USER,
    getter: 'user.name',
    headerType: ColHeaderTypeEnum.sortFilter,
    searchableFilter: true,
    filterable: true,
    sortable: false,
    header: 'USER',
    style: {width: '115px'},
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.STARTED,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterType: ColHeaderFilterTypeEnum.durationDate,
    filterable: true,
    searchableFilter: false,
    header: 'STARTED',
    style: {width: '150px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.ACTIVE_DURATION,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterable: true,
    filterType: ColHeaderFilterTypeEnum.duration,
    searchableFilter: false,
    bodyStyleClass: 'type-col',
    header: 'RUN TIME',
    style: {width: '150px'}
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterType: ColHeaderFilterTypeEnum.durationDate,
    filterable: true,
    searchableFilter: false,
    header: 'UPDATED',
    style: {width: '150px'},
  }
];

export const PIPELINE_INFO_ONLY_FIELDS = [
  'id',
  'name',
  'user.name',
  'company',
  'type',
  'status',
  'status_changed',
  'created',
  'started',
  'last_update',
  'last_change',
  'completed',
  'models.output.model.name',
  'models.output.model.project',
  'execution.artifacts',
  'execution.queue',
  'configuration',
  'hyperparams',
  'system_tags',
  'published',
  'runtime',
  'last_metrics',
  'runtime._pipeline_hash',
  'runtime.version',
  'models.output.model.name',
  'execution.artifacts'
];
