import {ChangeDetectionStrategy, Component, EventEmitter, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import * as actions from './select-model.actions';
import {
  selectGlobalFilter, selectIsAllProjectsMode, selectModels, selectNoMoreModels, selectSelectedModels, selectSelectedModelsList, selectTableFilters, selectTableSortFields, selectViewMode
} from './select-model.reducer';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {SelectedModel} from '../models/shared/models.model';
import {MODELS_TABLE_COLS, ModelsViewModesEnum} from '../models/models.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {selectAllProjectsUsers, selectProjectSystemTags, selectProjectUsers, selectSelectedProject, selectTablesFilterProjectsOptions} from '../core/reducers/projects.reducer';
import {selectModelsFrameworks, selectModelsTags} from '../models/reducers';
import {User} from '~/business-logic/model/users/user';
import * as modelsActions from '../models/actions/models-view.actions';
import {SortMeta} from 'primeng/api';
import {ModelsTableComponent} from '@common/models/shared/models-table/models-table.component';
import {map, tap} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/models';
import {getTablesFilterProjectsOptions, resetTablesFilterProjectsOptions, setTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {clearTableFilter, setSelectedModels, showArchive} from './select-model.actions';
import {unionBy} from 'lodash-es';
import {compareLimitations} from '@common/shared/entity-page/footer-items/compare-footer-item';
import {addMessage} from '@common/core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '@common/constants';

@Component({
  selector: 'sm-select-model',
  templateUrl: './select-model.component.html',
  styleUrls: ['./select-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectModelComponent implements OnInit, OnDestroy {

  public models$: Observable<SelectedModel[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public noMoreModels$: Observable<boolean>;
  public isAllProjects$: Observable<boolean>;
  public tableFilters$: Observable<{ [s: string]: FilterMetadata }>;
  public searchValue$: Observable<string>;
  public selectedModels$: Observable<Array<any>>;
  public viewMode$: Observable<ModelsViewModesEnum>;
  public users$: Observable<Array<User>>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public tableCols = MODELS_TABLE_COLS;
  public selectedProject$: Observable<Project>;
  public projectsOptions$: Observable<Project[]>;
  public frameworks$: Observable<string[]>;
  private subs = new Subscription();

  private isAllProjects: any;
  public selectedProject: Project;
  private selectedModels: Array<SelectedModel>;

  constructor(private store: Store<any>,
              public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                selectionMode: 'multiple' | 'single' | null;
                selectedModels: string[];
                header: string;
                hideShowArchived: boolean;
              }) {
    // this.models$ = this.store.select(selectModelsList);
    this.models$ = combineLatest([
      this.store.select(selectModels),
      this.store.select(selectSelectedModelsList),
    ]).pipe(map(([models, selectedModels]) => unionBy(selectedModels, models, 'id')));
    this.tableSortFields$ = this.store.select(selectTableSortFields);
    this.tableFilters$ = this.store.select(selectTableFilters);
    this.selectedModels$ = this.store.select(selectSelectedModels).pipe(tap(models => this.selectedModels = models));
    this.viewMode$ = this.store.select(selectViewMode);
    this.searchValue$ = this.store.select(selectGlobalFilter);
    this.noMoreModels$ = this.store.select(selectNoMoreModels);
    this.isAllProjects$ = this.store.select(selectIsAllProjectsMode);
    this.users$ = combineLatest([
      this.isAllProjects$,
      this.store.select(selectProjectUsers),
      this.store.select(selectAllProjectsUsers),
    ]).pipe(
      tap(([all]) => this.isAllProjects = all),
      map(([all, projUsers, allUsers]) => all ? allUsers : projUsers));
    this.tags$ = this.store.select(selectModelsTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.subs.add(this.store.select(selectSelectedProject).subscribe(selectedProject => this.selectedProject = selectedProject));
    this.frameworks$ = this.store.select(selectModelsFrameworks);

    this.projectsOptions$ = this.store.select(selectTablesFilterProjectsOptions);

    // if (data.selectedModels) {
    //   this.store.dispatch(setSelectedModels({models: data.selectedModels.map(modelId => ({id: modelId}))}));
    // }
  }

  @ViewChild(ModelsTableComponent) table: ModelsTableComponent;

  ngOnInit() {
    this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(actions.getNextModels());
    this.data.selectedModels && this.store.dispatch(actions.getSelectedModels({selectedIds: this.data.selectedModels}));
    this.store.dispatch(modelsActions.getAllProjectsFrameworks());
    this.store.dispatch(modelsActions.getTagsForAllProjects());
    window.setTimeout(() => this.table.table.rowRightClick = new EventEmitter());
  }

  ngOnDestroy(): void {
    this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(actions.resetState());
    this.subs.unsubscribe();
  }

  closeDialog(modelId: string) {
    if (modelId) {
      return this.dialogRef.close(modelId);
    }
    return this.dialogRef.close(null);
  }

  closeDialogMultiple() {
    return this.dialogRef.close(this.selectedModels.map( model => model.id));
  }
  getNextModels() {
    this.store.dispatch(actions.getNextModels());
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(actions.tableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }

  filterChanged(filter: { col: ISmCol; value: any }) {
    this.store.dispatch(actions.tableFilterChanged({col: filter.col, value: filter.value}));
  }

  onSearchValueChanged(value: string) {
    this.store.dispatch(actions.globalFilterChanged({filter: value}));
  }

  modelSelectionChanged(event: { model: SelectedModel }) {
    if (this.data.selectionMode !== 'multiple') {
      this.closeDialog(event.model?.id);
    }
  }

  modelsSelectionChanged(models: SelectedModel[]) {
    if (this.data.selectionMode !== 'multiple') {
      return;
    }
      if (models.length === 0) {
        this.store.dispatch(addMessage(MESSAGES_SEVERITY.WARN, 'Compare module should include at least one model'));
        return;
      }
      if (models.length <= compareLimitations) {
        this.store.dispatch(setSelectedModels({models}));
      } else {
        this.store.dispatch(addMessage(MESSAGES_SEVERITY.WARN, compareLimitations + ' or fewer models can be compared'));
      }
  }

  onIsAllProjectsChanged(isAllProjects: boolean) {
    this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(actions.allProjectsModeChanged({isAllProjects}));
    isAllProjects ? this.store.dispatch(modelsActions.getTagsForAllProjects()) : this.store.dispatch(modelsActions.getTags());
    isAllProjects ? this.store.dispatch(modelsActions.getAllProjectsFrameworks()) : this.store.dispatch(modelsActions.getFrameworks());
  }

  filterSearchChanged({value}: { colId: string; value: {value: string; loadMore?: boolean} }) {
    if (this.isAllProjects) {
      ! value.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
      this.store.dispatch(getTablesFilterProjectsOptions({searchString: value.value || '', loadMore: value.loadMore}));
    } else {
      this.store.dispatch(setTablesFilterProjectsOptions({projects: this.selectedProject ? [this.selectedProject, ...this.selectedProject?.sub_projects] : [], scrollId: null}));
    }
  }

  clearFilters() {
    this.store.dispatch(clearTableFilter());
  }

  showArchives($event: boolean) {
    this.store.dispatch(showArchive({showArchive: $event}));
  }
}
