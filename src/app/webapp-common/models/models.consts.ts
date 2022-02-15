import {ColHeaderTypeEnum, ISmCol} from '../shared/ui-components/data/table/table.consts';
import {MODELS_TABLE_COL_FIELDS} from './shared/models.const';

export type ModelWizardMethodsEnum = 'create' | 'edit' | 'clone' | 'extend';
export const WIZARD_METHODS = {
  CREATE: 'create' as ModelWizardMethodsEnum,
  CLONE : 'clone' as ModelWizardMethodsEnum,
  EDIT  : 'edit' as ModelWizardMethodsEnum,
  EXTEND: 'extend' as ModelWizardMethodsEnum,
};

export type ModelsViewModesEnum = 'table' | 'tree';
export const MODELS_VIEW_MODES = {
  TABLE: 'table' as ModelsViewModesEnum,
  TREE : 'tree' as ModelsViewModesEnum,
};

export const MODELS_PAGE_SIZE = 15;
export const MODELS_STORE_KEY = 'models';

export const MODELS_PREFIX_INFO = 'MODELS_INFO_';
export const MODELS_PREFIX_MENU = 'MODELS_MENU_';
export const MODELS_PREFIX_VIEW = 'MODELS_';


export const STATUS = {
  PUBLISHED: 'Published',
  DRAFT    : 'Draft'
};

export const VIEWS = {
  TREE : 'TREE',
  TABLE: 'TABLE'
};

export const ASC = 1;
export const DESC = -1;
export const MODELS_TABLE_COLS: ISmCol[] = [
  {
    id              : MODELS_TABLE_COL_FIELDS.SELECTED,
    headerType      : ColHeaderTypeEnum.checkBox,
    sortable        : false,
    filterable      : false,
    hidden          : false,
    header          : '',
    headerStyleClass: 'selected-col-header',
    style           : {width: '70px', maxWidth: '70px'},
    disableDrag     : true,
    disablePointerEvents: true
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.FRAMEWORK,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable    : true,
    filterable  : true,
    header      : 'FRAMEWORK',
    style       : {width: '100px'},
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.NAME,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable    : true,
    header      : 'NAME',
    style       : {width: '160px'},
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.TAGS,
    headerType  : ColHeaderTypeEnum.sortFilter,
    filterable  : true,
    sortable    : false,
    searchableFilter: true,
    header      : 'TAGS',
    style       : {width: '240px'},
    excludeFilter: true,
    andFilter: true,
    columnExplain: 'Click to include tag. Click again to exclude.'
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.READY,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable    : true,
    filterable  : true,
    header      : 'STATUS',
    hidden      : false,
    style       : {width: '135px'},
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.PROJECT,
    header      : 'PROJECT',
    style       : {width: '135px'}
  },
  {
    id              : MODELS_TABLE_COL_FIELDS.USER,
    headerType      : ColHeaderTypeEnum.sortFilter,
    searchableFilter: true,
    filterable      : true,
    sortable        : false,
    static          : true,
    header          : 'USER',
    style           : {width: '240px'}
  },
  {
    id        : MODELS_TABLE_COL_FIELDS.TASK,
    headerType: ColHeaderTypeEnum.title,
    sortable  : false,
    header    : 'TASK',
    style     : {width: '240px'}
  },
  {
    id        : MODELS_TABLE_COL_FIELDS.LAST_UPDATE,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable  : true,
    header    : 'UPDATED',
    label     : 'Updated',
    style     : {width: '120px'}
  },
  {
    id        : MODELS_TABLE_COL_FIELDS.COMMENT,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable  : true,
    hidden    : true,
    header    : 'DESCRIPTION',
    style     : {width: '240px'}
  },
];
