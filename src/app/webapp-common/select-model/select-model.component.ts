import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import * as actions from './select-model.actions';
import {selectModelsList, selectSelectedModels, selectViewMode} from './select-model.reducer';
import {Observable} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {SelectedModel} from '../models/shared/models.model';
import {selectGlobalFilter, selectIsAllProjectsMode, selectNoMoreModels, selectTableFilters, selectTableSortFields} from './select-model.reducer';
import {MODELS_TABLE_COLS, ModelsViewModesEnum} from '../models/models.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {selectProjectSystemTags, selectProjectTags} from '../core/reducers/projects.reducer';
import {getTags} from '../core/actions/projects.actions';
import {selectModelsUsers} from '../models/reducers';
import {User} from '../../business-logic/model/users/user';
import * as modelsActions from '../models/actions/models-view.actions';
import {SortMeta} from 'primeng/api';

@Component({
  selector   : 'sm-select-model',
  templateUrl: './select-model.component.html',
  styleUrls  : ['./select-model.component.scss']
})
export class SelectModelComponent implements OnInit, OnDestroy {

  public models$: Observable<SelectedModel[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public noMoreModels$: Observable<boolean>;
  public isAllProjects$: Observable<boolean>;
  public tableFilters$: Observable<{[s: string]: FilterMetadata}>;
  public searchValue$: Observable<string>;
  public selectedModels$: Observable<Array<any>>;
  public viewMode$: Observable<ModelsViewModesEnum>;
  public users$: Observable<Array<User>>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public tableCols = MODELS_TABLE_COLS;

  constructor(private store: Store<any>, public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
    this.models$         = this.store.select(selectModelsList);
    this.tableSortFields$ = this.store.select(selectTableSortFields);
    this.tableFilters$   = this.store.select(selectTableFilters);
    this.selectedModels$ = this.store.select(selectSelectedModels);
    this.viewMode$       = this.store.select(selectViewMode);
    this.searchValue$    = this.store.select(selectGlobalFilter);
    this.noMoreModels$   = this.store.select(selectNoMoreModels);
    this.isAllProjects$  = this.store.select(selectIsAllProjectsMode);
    this.users$ = this.store.select(selectModelsUsers);
    this.tags$ = this.store.select(selectProjectTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
  }

  ngOnInit() {
    this.store.dispatch(new actions.GetNextModels());
    this.store.dispatch(modelsActions.getUsers());
    this.store.dispatch(getTags());
  }

  ngOnDestroy(): void {
    this.store.dispatch(new actions.ResetState());
  }

  closeDialog(model: SelectedModel) {
    if (model) {
      return this.dialogRef.close(model);
    }
    return this.dialogRef.close(null);
  }

  getNextModels() {
    this.store.dispatch(new actions.GetNextModels());
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(actions.tableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }

  filterChanged(filter: {col: ISmCol; value: any}) {
    this.store.dispatch(new actions.TableFilterChanged({col: filter.col, value: filter.value}));
  }

  onSearchValueChanged(value: string) {
    this.store.dispatch(new actions.GlobalFilterChanged(value));
  }

  modelSelectionChanged(model: SelectedModel) {
    this.closeDialog(model);
  }

  onIsAllProjectsChanged(isAllProjects: boolean) {
    this.store.dispatch(new actions.ArchivAllProjectsdModeChanged(isAllProjects));
  }

}
