import {Observable} from 'rxjs/internal/Observable';
import {IconNames} from '@common/constants';
import {of} from 'rxjs';
import { MenuItemTextPipe } from '@common/shared/pipes/menu-item-text.pipe';

export abstract class ItemFooterModel {
  id: string;
  icon: IconNames;
  title: string;
  description: string;
  disable: boolean;
  disableDescription: string;
  emit = true;
  isTag?: boolean;
  class = '';
  wrapperClass = '';
  state$: Observable<IItemFooterState> = of({});
  tags$?: Observable<string[]>;
  companyTags$?:   Observable<string[]>;
  projectTags$?: Observable<string[]>;
  tagsFilterByProject$?: Observable<boolean>;

  menuItemText = new MenuItemTextPipe();
  abstract getItemState(state: IFooterState<any>): {
    icon?: IconNames;
    title?: string;
    description?: string;
    disable?: boolean;
    disableDescription?: string;
    emit?: boolean;
    emitValue?: any;
    preventCurrentItem?: boolean;
    class?: string;
    wrapperClass?: string;
    tags?: string[];
    tagSelected?: string[];
    projectTags?: string[];
    companyTags?: string[];
    tagsFilterByProject?: boolean;
  };
}

export interface IItemFooterState {
  icon?: Partial<IconNames>;
  title?: string;
  emitValue?: any;
  description?: string;
  disableDescription?: string;
  disable?: boolean;
  class?: string;
  preventCurrentItem?: boolean;
}

export interface IFooterState<T extends any> {
  selectionHasExample: boolean;
  selectionAllHasExample: boolean;
  selected: Array<T>;
  showAllSelectedIsActive: boolean;
  selectionAllIsArchive: boolean;
  selectionIsOnlyExamples: boolean;
  data: Record<string, {  available: number; disable: boolean; selectedFiltered: Array<T> }>;
  companyTags: string[];
  projectTags: string[];
  tagsFilterByProject: boolean;
}










