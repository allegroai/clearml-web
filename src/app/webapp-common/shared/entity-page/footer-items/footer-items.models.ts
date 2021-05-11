import {Observable} from 'rxjs/internal/Observable';
import {IconNames} from '@common/constants';
import {of} from "rxjs";
import { MenuItemTextPipe } from '@common/shared/pipes/menu-item-text.pipe';

export class ItemFooterModel {
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
  emitValue$ = of(undefined);
  state$: Observable<IItemFooterState> = of({});
  tags$?: Observable<string[]>;
  companyTags$?:   Observable<string[]>;
  projectTags$?: Observable<string[]>;
  tagsFilterByProject$?: Observable<boolean>;

  menuItemText = new MenuItemTextPipe();
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
  selectionAllIsArchive: boolean;
  selectionIsOnlyExamples: boolean;
  data: Record<string, {  available: number; disable: boolean; selectedFiltered: Array<T> }>;
}










