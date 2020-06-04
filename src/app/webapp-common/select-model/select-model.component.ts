import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import * as actions from './select-model.actions';
import {selectModelsList, selectSelectedModels, selectViewMode} from './select-model.reducer';
import {Observable} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../webapp-common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {Model} from '../../business-logic/model/models/model';
import {ISmCol, TableSortOrderEnum} from '../../webapp-common/shared/ui-components/data/table/table.consts';
import {ITableModel, ModelTableColFieldsEnum} from '../../webapp-common/models/shared/models.model';
import {selectGlobalFilter, selectIsAllProjectsMode, selectNoMoreModels, selectTableFilters, selectTableSortField, selectTableSortOrder} from '../select-model/select-model.reducer';
import {MODELS_TABLE_COLS, ModelsViewModesEnum} from '../../webapp-common/models/models.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {selectProjectSystemTags, selectProjectTags} from '../core/reducers/projects.reducer';
import {getTags} from '../core/actions/projects.actions';
import {selectModelsUsers} from '../models/reducers';
import {User} from '../../business-logic/model/users/user';
import * as modelsActions from '../models/actions/models-view.actions';

@Component({
  selector   : 'sm-select-model',
  templateUrl: './select-model.component.html',
  styleUrls  : ['./select-model.component.scss']
})
export class SelectModelComponent implements OnInit, OnDestroy {

  public models$: Observable<Array<Model>>;
  public tableSortField$: Observable<string>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public noMoreModels$: Observable<boolean>;
  public isAllProjects$: Observable<boolean>;
  public tableFilters$: Observable<Map<ModelTableColFieldsEnum, FilterMetadata>>;
  public searchValue$: Observable<string>;
  public selectedModels$: Observable<Array<any>>;
  public viewMode$: Observable<ModelsViewModesEnum>;
  public users$: Observable<Array<User>>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public tableCols = MODELS_TABLE_COLS;

  constructor(private store: Store<any>, public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
    this.models$         = this.store.select(selectModelsList);
    this.tableSortField$ = this.store.select(selectTableSortField);
    this.tableSortOrder$ = this.store.select(selectTableSortOrder);
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

  closeDialog(model: ITableModel) {
    if (model) {
      return this.dialogRef.close(model);
    }
    return this.dialogRef.close(null);
  }

  getNextModels() {
    this.store.dispatch(new actions.GetNextModels());
  }

  sortedChanged(sort: { sortOrder: TableSortOrderEnum, colId: ISmCol['id'] }) {
    this.store.dispatch(new actions.TableSortChanged(sort.colId, sort.sortOrder));
  }

  filterChanged(filter: {col: ISmCol; value: any;}) {
    this.store.dispatch(new actions.TableFilterChanged({col: filter.col, value: filter.value}));
  }

  onSearchValueChanged(value: string) {
    this.store.dispatch(new actions.GlobalFilterChanged(value));
  }

  modelSelectionChanged(model: ITableModel) {
    this.closeDialog(model);
  }

  onIsAllProjectsChanged(isAllProjects: boolean) {
    this.store.dispatch(new actions.ArchivAllProjectsdModeChanged(isAllProjects));
  }

}
